import { useContext } from 'react';
import QuotesContext from './quotes-context';

export default function useQuotes() {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotes debe usarse dentro de QuotesProvider.');
  }
  return context;
}
