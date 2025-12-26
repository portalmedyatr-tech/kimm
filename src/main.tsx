import ReactDOM from 'react-dom/client';
import Game from './pages/Game';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<Game />);
}
