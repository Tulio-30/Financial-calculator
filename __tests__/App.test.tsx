import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import App from '../App';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome'
}));

describe('Testes de Integração - Interface Visual (App)', () => {
  
  it('1. Simula uma conta de multiplicação usando os botões visuais (2 × 3 = 6)', () => {
    const { getByText, getByTestId } = render(<App />);
    
    // Simula o clique nos botões reais da tela
    fireEvent.press(getByText('2'));
    fireEvent.press(getByText('ENTER'));
    fireEvent.press(getByText('3'));
    fireEvent.press(getByText('×')); 
    
    // Apanha o valor renderizado no visor
    const display = getByTestId('display');
    
    // Verifica se o visor mostra 6
    expect(display.props.children).toBe('6.00');
  });

  it('2. Navegação: Abre o painel lateral de Histórico e verifica se renderiza corretamente', () => {
    const { getByText } = render(<App />);
    
    // Clica no botão "Histórico" 
    fireEvent.press(getByText('Histórico', { exact: true }));
    
    // Verifica se o título do menu apareceu
    const painelTitulo = getByText('Operações Recentes');
    expect(painelTitulo).toBeTruthy();
  });
});