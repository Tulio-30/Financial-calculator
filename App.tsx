import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useCalculator from './Calculator';

export default function App() {
  const { 
    displayValue, executeCommand, handleNumber, activeModifier, 
    history, stack, registers, clearHistory, clearMemory 
  } = useCalculator();
  
  const [activeTab, setActiveTab] = useState<'history' | 'memory' | null>(null);

  const openSideMenu = (tab: 'history' | 'memory') => setActiveTab(tab);
  const closeSideMenu = () => setActiveTab(null);

  // Função crucial para evitar o erro do React ao tentar renderizar objetos Decimal/Big.js
  const formatVal = (val: any) => {
    if (val === undefined || val === null) return '0.00';
    if (typeof val === 'object' && typeof val.toString === 'function') return val.toString();
    return String(val);
  };

  const DashedGroup = ({ title }: { title: string }) => (
    <View style={styles.dashedGroupContainer}>
      <View style={styles.dashedGroupTop}>
        <View style={styles.dashHorizontal} />
        <Text style={styles.groupText}>{title}</Text>
        <View style={styles.dashHorizontal} />
      </View>
      <View style={styles.dashedGroupLegs}>
        <View style={styles.dashVertical} /><View style={styles.dashVertical} />
      </View>
    </View>
  );

  const renderButton = (label: string, cmd: string | null, type: 'numeric' | 'functional' | 'modifier' = 'numeric', goldLabel?: string, blueLabel?: string, isVerticalEnter: boolean = false) => {
    let bgColor = '#F5F5F5'; 
    if (type === 'functional') bgColor = '#F2F2F2';
    if (type === 'modifier') bgColor = label === 'f' ? '#FFB000' : '#008CBA';
    return (
      <View style={styles.keyWrapper}>
        <Text style={styles.goldLabelText}>{goldLabel ? goldLabel : ' '}</Text>
        <TouchableOpacity style={[styles.btnBase, { backgroundColor: bgColor }]} onPress={() => cmd ? executeCommand(cmd) : handleNumber(label)} activeOpacity={0.7}>
          <View style={styles.mainLabelContainer}><Text style={styles.mainLabelText}>{label}</Text></View>
          <Text style={styles.blueLabelText}>{blueLabel ? blueLabel : ' '}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EAEAEA" hidden={true} />
      
      <View style={styles.topRightNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => openSideMenu('history')}><Text style={styles.navButtonText}>Histórico</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => openSideMenu('memory')}><Text style={styles.navButtonText}>Memória</Text></TouchableOpacity>
      </View>

      <View style={styles.calculatorSection}>
        <View style={styles.calculatorBody}>
          
          <View style={styles.displayContainer}>
            {activeModifier && <Text style={styles.modifierText}>{activeModifier.toUpperCase()}</Text>}
            <Text testID="display" style={styles.displayText} numberOfLines={1}>{formatVal(displayValue) || '0.00'}</Text>
          </View>

          <View style={styles.keyboard}>
            <View style={styles.mainGrid}>
              
              {/* BLOCO ESQUERDO */}
              <View style={styles.leftBlock}>
                <View style={styles.row}>
                  {renderButton('n', 'CMD_N', 'functional', 'AMORT', '12×')}
                  {renderButton('i', 'CMD_I', 'functional', 'INT', '12÷')}
                  {renderButton('PV', 'CMD_PV', 'functional', 'NPV', 'CF0')}
                  {renderButton('PMT', 'CMD_PMT', 'functional', 'RND', 'CFj')}
                  {renderButton('FV', 'CMD_FV', 'functional', 'IRR', 'Nj')}
                  {renderButton('CHS', 'CHS', 'functional', 'DATE', 'BEG')}
                </View>
                <View style={styles.phantomRow}>
                  <View style={{ flex: 2, paddingHorizontal: 2 }}><DashedGroup title="BOND" /></View>
                  <View style={{ flex: 3, paddingHorizontal: 2 }}><DashedGroup title="DEPRECIATION" /></View>
                  <View style={{ flex: 1 }} />
                </View>
                <View style={styles.row}>
                  {renderButton('Y x', 'Y_POW', 'functional', 'PRICE', '√x')}
                  {renderButton('1/x', 'INV_X', 'functional', 'YTM', 'eˣ')}
                  {renderButton('%T', 'PERC_TOT', 'functional', 'SL', 'LN')}
                  {renderButton('Δ%', 'DELTA_PERCENT', 'functional', 'SOYD', 'FRAC')}
                  {renderButton('%', 'PERCENT', 'functional', 'DB', 'INTG')}
                  {renderButton('EEX', 'EEX', 'functional', '', 'ΔDYS')}
                </View>
                <View style={styles.phantomRow}>
                  <View style={{ flex: 1 }} />
                  <View style={{ flex: 5, paddingHorizontal: 2 }}><DashedGroup title="CLEAR" /></View>
                </View>
                <View style={{ flex: 2, flexDirection: 'row' }}>
                  <View style={{ flex: 5 }}>
                    <View style={styles.row}>
                      {renderButton('R/S', 'rs', 'functional', 'P/R', 'PSE')}
                      {renderButton('SST', 'sst', 'functional', 'Σ', 'BST')}
                      {renderButton('R↓', 'ROLL_DOWN', 'functional', 'PRGM', 'GTO')}
                      {renderButton('x⇄y', 'SWAP', 'functional', 'FIN', 'x≤y')}
                      {renderButton('CLx', 'CLX', 'functional', 'REG', 'x=0')}
                    </View>
                    <View style={styles.row}>
                      {renderButton('ON', 'CMD_ON', 'functional', '', '')}
                      {renderButton('f', 'f', 'modifier', '', '')}
                      {renderButton('g', 'g', 'modifier', '', '')}
                      {renderButton('STO', 'STO', 'functional', '', 'x>')}
                      {renderButton('RCL', 'RCL', 'functional', '', 'x<0')}
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>{renderButton('ENTER', 'ENTER', 'functional', 'PREFIX', 'LSTx', true)}</View>
                </View>
              </View>

              <View style={styles.blockGap} />

              {/* BLOCO DIREITO */}
              <View style={styles.rightBlock}>
                <View style={styles.row}>
                  {renderButton('7', null, 'numeric', '', 'BEG')}
                  {renderButton('8', null, 'numeric', '', 'END')}
                  {renderButton('9', null, 'numeric', '', 'MEM')}
                  {renderButton('÷', 'DIV', 'functional', '', '')}
                </View>
                <View style={styles.phantomRow} />
                <View style={styles.row}>
                  {renderButton('4', null, 'numeric', '', 'D.MY')}
                  {renderButton('5', null, 'numeric', '', 'M.DY')}
                  {renderButton('6', null, 'numeric', '', 'x̄ w')}
                  {renderButton('×', 'MULT', 'functional', '', '')}
                </View>
                <View style={styles.phantomRow} />
                <View style={styles.row}>
                  {renderButton('1', null, 'numeric', '', 'x̄, r')}
                  {renderButton('2', null, 'numeric', '', 'ȳ, r')}
                  {renderButton('3', null, 'numeric', '', 'n!')}
                  {renderButton('-', 'MINUS', 'functional', '', '')}
                </View>
                <View style={styles.row}>
                  {renderButton('0', null, 'numeric', '', 'x̄')}
                  {renderButton('.', null, 'numeric', '', 's')}
                  {renderButton('Σ+', 'sumPlus', 'functional', '', 'Σ-')}
                  {renderButton('+', 'PLUS', 'functional', '', '')} 
                </View>
              </View>

            </View>
          </View>
        </View>
      </View>

      {/* OVERLAY DE HISTÓRICO E MEMÓRIA IDÊNTICO À REFERÊNCIA */}
      {activeTab && (
        <View style={styles.overlayContainer}>
          <View style={styles.sideMenu}>
            
            {/* Abas no Topo */}
            <View style={styles.tabHeaderRow}>
              <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'history' && styles.activeTabBtn]} 
                onPress={() => setActiveTab('history')}
              >
                <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Histórico</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'memory' && styles.activeTabBtn]} 
                onPress={() => setActiveTab('memory')}
              >
                <Text style={[styles.tabText, activeTab === 'memory' && styles.activeTabText]}>Memória</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeIconBtn} onPress={closeSideMenu}>
                <Ionicons name="chevron-forward" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.sideMenuContent}>
              {activeTab === 'history' ? (
                <>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeaderTitle}>Operações Recentes</Text>
                    <TouchableOpacity onPress={clearHistory} style={styles.trashBtn}>
                      <Ionicons name="trash-outline" size={18} color="#D9534F" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {history && history.length > 0 ? (
                      history.map((item: any, index: number) => (
                        <Text key={index} style={styles.listText}>{formatVal(item)}</Text>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>Nenhum histórico.</Text>
                    )}
                  </ScrollView>
                </>
              ) : (
                <>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeaderTitle}>Registradores</Text>
                    <TouchableOpacity onPress={clearMemory} style={styles.trashBtn}>
                      <Ionicons name="trash-outline" size={18} color="#D9534F" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.listText}>Pilha T: {formatVal(stack?.t)}</Text>
                    <Text style={styles.listText}>Pilha Z: {formatVal(stack?.z)}</Text>
                    <Text style={styles.listText}>Pilha Y: {formatVal(stack?.y)}</Text>
                    <Text style={styles.listTextBold}>Pilha X: {formatVal(stack?.x)}</Text>
                    
                    <View style={styles.spacer} />
                    
                    {['0','1','2','3','4'].map((key) => (
                      <Text key={key} style={styles.listText}>
                        R{key}: {formatVal(registers?.[key])}
                      </Text>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>

          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEAEA' },
  topRightNav: { flexDirection: 'row', justifyContent: 'flex-end', padding: 4, zIndex: 10 },
  navButton: { backgroundColor: '#DCDCDC', paddingHorizontal: 16, paddingVertical: 6, marginLeft: 10, borderRadius: 4 },
  navButtonText: { fontSize: 12, color: '#333', fontWeight: '600' },
  calculatorSection: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingBottom: 6 },
  calculatorBody: { flex: 1, width: '100%', alignSelf: 'center', paddingHorizontal: 16 }, 
  displayContainer: { paddingHorizontal: 8, marginBottom: 4, justifyContent: 'center', alignItems: 'flex-start' },
  modifierText: { fontSize: 12, fontWeight: 'bold', color: '#333', position: 'absolute', top: -10, left: 16 },
  displayText: { fontSize: 32, color: '#000', fontWeight: '400', letterSpacing: 1 }, 
  keyboard: { flex: 1, width: '100%' },
  mainGrid: { flex: 1, flexDirection: 'row', width: '100%' },
  leftBlock: { flex: 6.5 },
  rightBlock: { flex: 4, justifyContent: 'flex-end' },
  blockGap: { width: '3%' },
  row: { flex: 1, flexDirection: 'row', width: '100%' }, 
  keyWrapper: { flex: 1, marginHorizontal: 2, marginVertical: 1, alignItems: 'center' },
  goldLabelText: { color: '#444', fontSize: 9, fontWeight: '700', textAlign: 'center', marginBottom: 1, height: 11 },
  btnBase: { flex: 1, width: '100%', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 2, borderRadius: 4, borderWidth: 1, borderColor: '#D9D9D9', elevation: 1 },
  mainLabelContainer: { flex: 1, justifyContent: 'center' },
  mainLabelText: { color: '#000', fontSize: 15, fontWeight: 'bold' },
  blueLabelText: { color: '#333', fontSize: 8, fontWeight: '700', textAlign: 'center' },
  phantomRow: { flex: 0, height: 12, flexDirection: 'row', width: '100%', alignItems: 'center' },
  dashedGroupContainer: { width: '100%' },
  dashedGroupTop: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  dashedGroupLegs: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', height: 4 },
  dashHorizontal: { flex: 1, height: 1, borderTopWidth: 1, borderColor: '#A0A0A0', borderStyle: 'dashed' },
  dashVertical: { width: 1, height: 4, backgroundColor: '#A0A0A0' },
  groupText: { fontSize: 8, color: '#555', fontWeight: 'bold', marginHorizontal: 4 },
  
  // Estilos Corrigidos da Gaveta
  overlayContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 20, flexDirection: 'row', justifyContent: 'flex-end' },
  sideMenu: { width: '45%', minWidth: 320, backgroundColor: '#FFF', height: '100%', shadowColor: '#000', shadowOffset: { width: -2, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
  
  tabHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', height: 48 },
  tabBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTabBtn: { borderBottomWidth: 2, borderBottomColor: '#000' },
  tabText: { fontSize: 13, color: '#888', fontWeight: '600' },
  activeTabText: { color: '#000', fontWeight: 'bold' },
  closeIconBtn: { width: 48, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#E0E0E0' },
  
  sideMenuContent: { flex: 1, padding: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionHeaderTitle: { fontSize: 13, fontWeight: 'bold', color: '#000' },
  trashBtn: { padding: 4 },
  
  listText: { fontSize: 14, color: '#333', fontFamily: 'monospace', marginBottom: 10 },
  listTextBold: { fontSize: 14, color: '#000', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 10 },
  spacer: { height: 16 },
  
  emptyText: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 40, fontSize: 14 },
});