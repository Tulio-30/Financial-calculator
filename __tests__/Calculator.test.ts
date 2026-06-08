import { renderHook, act } from '@testing-library/react-native';
import useCalculator from '../Calculator';

describe('Testes Unitários - Lógica RPN e TVM (useCalculator)', () => {
  
  it('1. Deve realizar uma soma simples (+)', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.handleNumber('2'));
    act(() => result.current.executeCommand('ENTER'));
    act(() => result.current.handleNumber('3'));
    act(() => result.current.executeCommand('PLUS'));
    
    expect(result.current.stack.x.toString()).toBe('5');
  });

  it('2. Deve realizar uma subtração simples (-)', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.handleNumber('10'));
    act(() => result.current.executeCommand('ENTER'));
    act(() => result.current.handleNumber('4'));
    act(() => result.current.executeCommand('MINUS'));
    
    expect(result.current.stack.x.toString()).toBe('6');
  });

  it('3. Deve realizar uma multiplicação (×)', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.handleNumber('5'));
    act(() => result.current.executeCommand('ENTER'));
    act(() => result.current.handleNumber('4'));
    act(() => result.current.executeCommand('MULT'));
    
    expect(result.current.stack.x.toString()).toBe('20');
  });

  it('4. Deve realizar uma divisão (÷)', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.handleNumber('20'));
    act(() => result.current.executeCommand('ENTER'));
    act(() => result.current.handleNumber('5'));
    act(() => result.current.executeCommand('DIV'));
    
    expect(result.current.stack.x.toString()).toBe('4');
  });

  it('5. Deve retornar Erro 0 ao tentar dividir por zero', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.handleNumber('10'));
    act(() => result.current.executeCommand('ENTER'));
    act(() => result.current.handleNumber('0'));
    act(() => result.current.executeCommand('DIV'));
    
    expect(result.current.displayValue).toBe('Error 0');
  });

    it('6. Deve inverter o sinal corretamente (CHS)', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.handleNumber('5')); // <-- Mudei de executeCommand para handleNumber
      act(() => result.current.executeCommand('ENTER')); 
      act(() => result.current.executeCommand('CHS'));
      
      expect(result.current.stack.x.toString()).toBe('-5');
    });

  it('7. Deve calcular a percentagem corretamente (%)', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.handleNumber('200'));
    act(() => result.current.executeCommand('ENTER'));
    act(() => result.current.handleNumber('15'));
    act(() => result.current.executeCommand('PERCENT'));
    
    expect(result.current.stack.x.toString()).toBe('30');
  });

  it('8. Deve guardar e recuperar um valor da Memória (STO e RCL)', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.handleNumber('99'));
    act(() => result.current.executeCommand('STO'));
    act(() => result.current.handleNumber('1'));
    act(() => result.current.executeCommand('CLX'));
    act(() => result.current.executeCommand('RCL'));
    act(() => result.current.handleNumber('1'));
    
    expect(result.current.stack.x.toString()).toBe('99');
  });

  it('9. Deve limpar a Pilha (X) ao usar CLx', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.handleNumber('123'));
    act(() => result.current.executeCommand('CLX'));
    
    expect(result.current.stack.x.toString()).toBe('0');
  });

  it('10. Deve ligar/limpar tudo corretamente (ON)', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.handleNumber('10'));
    act(() => result.current.executeCommand('CMD_ON'));
    
    expect(result.current.stack.x.toString()).toBe('0');
  });
});