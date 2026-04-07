import { render } from 'preact';
import { App } from './app';
import './styles/global.css';
import { initAuth } from './hooks/useAuth';

// 認証の初期化
initAuth();

render(<App />, document.getElementById('app'));

// Service Worker更新の即時反映
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            // 新しいSWが有効化されたらページをリロード
            window.location.reload();
          }
        });
      }
    });
  });
}
