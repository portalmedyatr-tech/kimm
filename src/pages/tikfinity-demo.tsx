import ReactDOM from 'react-dom/client';
import TikfinityWidget from '../components/TikfinityWidget';

export default function Demo() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Tikfinity Demo</h1>
      <p>Örnek CID: <code>1209191</code></p>
      <TikfinityWidget cid="1209191" apiBaseUrl="https://tikfinity.zerody.one" />
    </div>
  );
}

// If this file is used as an entry, mount demo
if (typeof document !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    const rootNode = ReactDOM.createRoot(root);
    rootNode.render(<Demo />);
  }
}
