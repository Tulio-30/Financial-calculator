import { useState } from 'react';
import Big from 'big.js';

interface Stack {
  x: Big;
  y: Big;
  z: Big;
  t: Big;
  lastX: Big;
}

interface Financials {
  n: Big;
  i: Big;
  pv: Big;
  pmt: Big;
  fv: Big;
}

interface Stats {
  n: number;
  sumX: Big;
  sumX2: Big;
  sumY: Big;
  sumY2: Big;
  sumXY: Big;
}

const useCalculator = () => {
  const [stack, setStack] = useState<Stack>({
    x: new Big(0),
    y: new Big(0),
    z: new Big(0),
    t: new Big(0),
    lastX: new Big(0)
  });

  const [financials, setFinancials] = useState<Financials>({
    n: new Big(0),
    i: new Big(0),
    pv: new Big(0),
    pmt: new Big(0),
    fv: new Big(0)
  });

  const [stats, setStats] = useState<Stats>({
    n: 0,
    sumX: new Big(0),
    sumX2: new Big(0),
    sumY: new Big(0),
    sumY2: new Big(0),
    sumXY: new Big(0)
  });

  const [registers, setRegisters] = useState<Big[]>(Array(10).fill(new Big(0))); 
  const [error, setError] = useState<string | null>(null);                       
  const [history, setHistory] = useState<string[]>([]);                          

  const [precision, setPrecision] = useState<number>(2);
  const [inputBuffer, setInputBuffer] = useState<string>(""); 
  const [isNewInput, setIsNewInput] = useState<boolean>(true);
  const [activeModifier, setActiveModifier] = useState<string | null>(null);
  const [isBeginMode] = useState<boolean>(false); 
  const [lastCommandWasEnter, setLastCommandWasEnter] = useState<boolean>(false);

  const displayValue = error 
    ? error 
    : (isNewInput && inputBuffer === "" 
        ? stack.x.toFixed(precision) 
        : inputBuffer || stack.x.toFixed(precision));

  const clearErrorIfActive = (): boolean => {
    if (error) {
      setError(null);
      setInputBuffer("");
      setIsNewInput(true);
      return true;
    }
    return false;
  };

  const addHistoryLog = (operation: string, result: Big) => {
    setHistory(prev => [`${operation}: ${result.toFixed(precision)}`, ...prev].slice(0, 6));
  };

  const pushBufferToStack = (currentStack: Stack): Stack => {
    if (inputBuffer !== "") {
      const value = new Big(inputBuffer);
      currentStack.lastX = currentStack.x;
      currentStack.x = value;
      setInputBuffer("");
    }
    return currentStack;
  };

  const calculateRateI = (currentFin: Financials): Big => {
    const n = parseFloat(currentFin.n.toString());
    const pv = parseFloat(currentFin.pv.toString());
    const pmt = parseFloat(currentFin.pmt.toString());
    const fv = parseFloat(currentFin.fv.toString());

    if (n <= 0) return new Big(0);

    const formulaTVM = (rate: number) => {
      if (rate === 0) return pv + (pmt * n) + fv;
      const factor = Math.pow(1 + rate, n);
      const annuityFactor = (1 - Math.pow(1 + rate, -n)) / rate;
      const beginMultiplier = isBeginMode ? (1 + rate) : 1;
      return pv + (pmt * annuityFactor * beginMultiplier) + (fv / factor);
    };

    let i = 0.1; 
    const maxIterations = 120;
    const tolerance = 1e-10;
    const h = 1e-6; 

    for (let k = 0; k < maxIterations; k++) {
      if (i <= -1) i = -0.9999; 

      const f = formulaTVM(i);
      const df = (formulaTVM(i + h) - formulaTVM(i - h)) / (2 * h);

      if (Math.abs(df) < 1e-12) break; 

      const nextI = i - f / df;

      if (Math.abs(nextI - i) < tolerance) {
       return new Big(Number((nextI * 100).toFixed(9)));
      }
      i = nextI;
    }

    setError("Error 5"); 
    return new Big(0);
  };

  const calculateTVM = (target: string, currentFin: Financials): Big => {
    const n = parseFloat(currentFin.n.toString());
    const i = parseFloat(currentFin.i.toString()) / 100;
    const pv = parseFloat(currentFin.pv.toString());
    const pmt = parseFloat(currentFin.pmt.toString());
    const fv = parseFloat(currentFin.fv.toString());

    let res = 0;

    if (i === 0 && target !== 'i') {
      if (n === 0 && target === 'n') { setError("Error 5"); return new Big(0); }
      switch (target) {
        case 'pv': return new Big(-(fv + pmt * n));
        case 'fv': return new Big(-(pv + pmt * n));
        case 'pmt': 
          if (n === 0) { setError("Error 0"); return new Big(0); } // Proteção adicionada aqui!
          res = -(pv + fv) / n; 
          break;
        case 'n': 
          res = pmt === 0 ? 0 : -(pv + fv) / pmt; 
          break;
      }
      return new Big(Number(res.toFixed(9)));
    }

    try {
      const factor = Math.pow(1 + i, n);
      const annFactor = (1 - Math.pow(1 + i, -n)) / i;
      const beginMultiplier = isBeginMode ? (1 + i) : 1;

      switch (target) {
        case 'pv':
          res = -(fv / factor + pmt * annFactor * beginMultiplier);
          break;
        case 'fv':
          res = -(pv * factor + pmt * annFactor * factor * beginMultiplier);
          break;
        case 'pmt':
          if (annFactor === 0) throw new Error("Div 0"); // Proteção adicionada aqui!
          res = -((pv * factor + fv) / (annFactor * factor * beginMultiplier));
          break;
        case 'n':
          const top = Math.log(Math.abs(fv * i - pmt * beginMultiplier) / Math.abs(pv * i + pmt * beginMultiplier));
          const bottom = Math.log(1 + i);
          if (bottom === 0) throw new Error("Div 0");
          res = Math.round(top / bottom);
          break;
      }
      if (!Number.isFinite(res) || Number.isNaN(res)) {
        throw new Error("Invalid Math");
      } 
      return new Big(Number(res.toFixed(9)));
     } 
     catch (e) {
      setError("Error 5");
      return new Big(0);
    }
  };

  const executeCommand = (cmd: string) => {
    clearErrorIfActive();
    let workingStack = { ...stack };

    switch (cmd) {
      case 'CMD_ON':
        clearMemory();
        return;
      case 'STO':
        setActiveModifier('sto');
        return;
      case 'RCL':
        setActiveModifier('rcl');
        return;

      case 'ENTER':
        workingStack = pushBufferToStack(workingStack);
        workingStack.t = workingStack.z;
        workingStack.z = workingStack.y;
        workingStack.y = workingStack.x;
        addHistoryLog("ENTER", workingStack.x);
        setIsNewInput(true);
        break;

      case 'PLUS':
        workingStack = pushBufferToStack(workingStack);
        workingStack.x = workingStack.y.plus(workingStack.x);
        workingStack.y = workingStack.z;
        workingStack.z = workingStack.t;
        addHistoryLog("+", workingStack.x);
        setIsNewInput(true);
        break;

        case 'sumPlus':
        workingStack = pushBufferToStack(workingStack);
        const valX = workingStack.x;
        const valY = workingStack.y;
        const newN = stats.n + 1;
        
        // Atualiza a memória estatística da calculadora
        setStats(prev => ({
          n: prev.n + 1,
          sumX: prev.sumX.plus(valX),
          sumX2: prev.sumX2.plus(valX.times(valX)),
          sumY: prev.sumY.plus(valY),
          sumY2: prev.sumY2.plus(valY.times(valY)),
          sumXY: prev.sumXY.plus(valX.times(valY))
        }));

        // A HP 12C sempre mostra a quantidade de itens (n) no visor após o somatório
        workingStack.lastX = valX;
        workingStack.x = new Big(newN);
        
        addHistoryLog("Σ+", workingStack.x);
        setIsNewInput(true);
        break;

      case 'MINUS':
        workingStack = pushBufferToStack(workingStack);
        workingStack.x = workingStack.y.minus(workingStack.x);
        workingStack.y = workingStack.z;
        workingStack.z = workingStack.t;
        addHistoryLog("-", workingStack.x);
        setIsNewInput(true);
        break;

      case 'MULT':
        workingStack = pushBufferToStack(workingStack);
        workingStack.x = workingStack.y.times(workingStack.x);
        workingStack.y = workingStack.z;
        workingStack.z = workingStack.t;
        addHistoryLog("×", workingStack.x);
        setIsNewInput(true);
        break;

      case 'DIV':
        workingStack = pushBufferToStack(workingStack);
        if (workingStack.x.eq(0)) {
          setError("Error 0"); 
        } else {
          workingStack.x = workingStack.y.div(workingStack.x);
          workingStack.y = workingStack.z;
          workingStack.z = workingStack.t;
          addHistoryLog("÷", workingStack.x);
        }
        setIsNewInput(true);
        break;

      // --- CÁLCULOS MATEMÁTICOS NOVOS E IMPLEMENTADOS ---
     case 'Y_POW':
        workingStack = pushBufferToStack(workingStack);
        try {
          const res = Math.pow(parseFloat(workingStack.y.toString()), parseFloat(workingStack.x.toString()));
          workingStack.x = new Big(res);
          // --- ESTAS SÃO AS DUAS LINHAS QUE FALTAVAM ---
          workingStack.y = workingStack.z;
          workingStack.z = workingStack.t;
          // ---------------------------------------------
          addHistoryLog("yⁿ", workingStack.x);
        } catch {
          setError("Error 0");
        }
        setIsNewInput(true);
        break;

      case 'INV_X':
        workingStack = pushBufferToStack(workingStack);
        if (workingStack.x.eq(0)) {
          setError("Error 0");
        } else {
          workingStack.x = new Big(1).div(workingStack.x);
          addHistoryLog("1/x", workingStack.x);
        }
        setIsNewInput(true);
        break;

      case 'PERCENT':
        workingStack = pushBufferToStack(workingStack);
        workingStack.x = workingStack.y.times(workingStack.x).div(100);
        addHistoryLog("%", workingStack.x);
        setIsNewInput(true);
        break;

      case 'DELTA_PERCENT':
        workingStack = pushBufferToStack(workingStack);
        if (workingStack.y.eq(0)) {
          setError("Error 0");
        } else {
          workingStack.x = workingStack.x.minus(workingStack.y).div(workingStack.y).times(100);
          addHistoryLog("Δ%", workingStack.x);
        }
        setIsNewInput(true);
        break;

      case 'PERC_TOT':
        workingStack = pushBufferToStack(workingStack);
        if (workingStack.y.eq(0)) {
          setError("Error 0");
        } else {
          workingStack.x = workingStack.x.div(workingStack.y).times(100);
          addHistoryLog("%T", workingStack.x);
        }
        setIsNewInput(true);
        break;

      case 'ROLL_DOWN':
        workingStack = pushBufferToStack(workingStack);
        const tempX = workingStack.x;
        workingStack.x = workingStack.y;
        workingStack.y = workingStack.z;
        workingStack.z = workingStack.t;
        workingStack.t = tempX;
        setIsNewInput(true);
        break;

      case 'SWAP':
        workingStack = pushBufferToStack(workingStack);
        const temp = workingStack.x;
        workingStack.x = workingStack.y;
        workingStack.y = temp;
        setIsNewInput(true);
        break;

      case 'LAST_X':
        workingStack.t = workingStack.z;
        workingStack.z = workingStack.y;
        workingStack.y = workingStack.x;
        workingStack.x = workingStack.lastX;
        setIsNewInput(true);
        break;

      case 'BACKSPACE':
        if (inputBuffer.length > 0) {
          const nextBuf = inputBuffer.slice(0, -1);
          setInputBuffer(nextBuf);
          workingStack.x = nextBuf === "" || nextBuf === "-" ? new Big(0) : new Big(nextBuf);
        }
        break;

      case 'EEX':
        if (inputBuffer !== "" && !inputBuffer.includes("e")) {
          setInputBuffer(inputBuffer + "e");
        }
        break;

      // Execuções TVM
      case 'CMD_N':
        if (inputBuffer === "") {
          workingStack.x = calculateTVM('n', financials);
        } else {
          const val = new Big(inputBuffer);
          setFinancials(prev => ({ ...prev, n: val }));
          workingStack.lastX = workingStack.x;
          workingStack.x = val;
          setInputBuffer("");
        }
        addHistoryLog("n", workingStack.x);
        setIsNewInput(true);
        break;

      case 'CMD_I':
        if (inputBuffer === "") {
          workingStack.x = calculateRateI(financials);
        } else {
          const val = new Big(inputBuffer);
          setFinancials(prev => ({ ...prev, i: val }));
          workingStack.lastX = workingStack.x;
          workingStack.x = val;
          setInputBuffer("");
        }
        addHistoryLog("i", workingStack.x);
        setIsNewInput(true);
        break;

      case 'CMD_PV':
        if (inputBuffer === "") {
          workingStack.x = calculateTVM('pv', financials);
        } else {
          const val = new Big(inputBuffer);
          setFinancials(prev => ({ ...prev, pv: val }));
          workingStack.lastX = workingStack.x;
          workingStack.x = val;
          setInputBuffer("");
        }
        addHistoryLog("PV", workingStack.x);
        setIsNewInput(true);
        break;

      case 'CMD_PMT':
        if (inputBuffer === "") {
          workingStack.x = calculateTVM('pmt', financials);
        } else {
          const val = new Big(inputBuffer);
          setFinancials(prev => ({ ...prev, pmt: val }));
          workingStack.lastX = workingStack.x;
          workingStack.x = val;
          setInputBuffer("");
        }
        addHistoryLog("PMT", workingStack.x);
        setIsNewInput(true);
        break;

      case 'CMD_FV':
        if (inputBuffer === "") {
          workingStack.x = calculateTVM('fv', financials);
        } else {
          const val = new Big(inputBuffer);
          setFinancials(prev => ({ ...prev, fv: val }));
          workingStack.lastX = workingStack.x;
          workingStack.x = val;
          setInputBuffer("");
        }
        addHistoryLog("FV", workingStack.x);
        setIsNewInput(true);
        break;

      case 'CLX':
        workingStack.x = new Big(0);
        setInputBuffer("");
        setIsNewInput(true);
        break;

      case 'CHS':
        if (inputBuffer !== "") {
          setInputBuffer(inputBuffer.startsWith("-") ? inputBuffer.substring(1) : "-" + inputBuffer);
        } else {
          workingStack.x = workingStack.x.times(-1);
        }
        break;

      case 'f':
        workingStack = pushBufferToStack(workingStack);
        setActiveModifier('f');
        return; 
      case 'g':
        workingStack = pushBufferToStack(workingStack);
        setActiveModifier('g');
        return;

      default:
        break;
    }

    setLastCommandWasEnter(cmd === 'ENTER');

    setStack(workingStack);
    if (activeModifier !== 'sto' && activeModifier !== 'rcl') {
      setActiveModifier(null);
    }
  };

  const handleNumber = (num: string) => {
    clearErrorIfActive();
    const regIndex = parseInt(num);

    if (activeModifier === 'sto' && !isNaN(regIndex)) {
      setRegisters(prev => {
        const next = [...prev];
        next[regIndex] = stack.x;
        return next;
      });
      addHistoryLog(`STO ${regIndex}`, stack.x);
      setActiveModifier(null);
      setIsNewInput(true);
      return;
    }

    if (activeModifier === 'rcl' && !isNaN(regIndex)) {
      setStack(prev => ({
        ...prev,
        t: prev.z,
        z: prev.y,
        y: prev.x,
        x: registers[regIndex]
      }));
      addHistoryLog(`RCL ${regIndex}`, registers[regIndex]);
      setActiveModifier(null);
      setIsNewInput(true);
      return;
    }

    if (activeModifier === 'f') {
      if (!isNaN(parseInt(num))) {
        setPrecision(parseInt(num));
        setActiveModifier(null);
        setIsNewInput(true);
        return;
      }
    }

    let nextBuffer = inputBuffer;
    if (isNewInput) {
      setStack(prev => {
        if (!lastCommandWasEnter) {
          return { ...prev, t: prev.z, z: prev.y, y: prev.x };
        }
        return prev;
      });
      nextBuffer = num === '.' ? '0.' : num;
      setIsNewInput(false);
      setLastCommandWasEnter(false); // Limpamos a memória
    } else {
      if (num === '.' && inputBuffer.includes('.')) return; 
      nextBuffer = inputBuffer === "0" && num !== '.' ? num : inputBuffer + num;
    }

    setInputBuffer(nextBuffer);
    setStack(prev => ({ ...prev, x: new Big(nextBuffer) }));
  };
// Função para limpar o histórico de operações
const clearHistory = () => {
  setHistory([]);
};

// Função para limpar a memória dos registradores e da pilha (stack)
const clearMemory = () => {
  setRegisters(Array(10).fill(new Big(0)));
  setStack({
    x: new Big(0),
    y: new Big(0),
    z: new Big(0),
    t: new Big(0),
    lastX: new Big(0)
  });
};

return { 
  displayValue, 
  executeCommand, 
  handleNumber, 
  activeModifier, 
  precision,
  history,
  stack,
  registers,
  clearHistory, 
  clearMemory   
};
}; 
export default useCalculator;