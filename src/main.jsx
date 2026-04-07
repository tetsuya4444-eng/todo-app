import { render } from 'preact';
import { App } from './app';
import './styles/global.css';
import { initAuth } from './hooks/useAuth';

// 認証の初期化
initAuth();

render(<App />, document.getElementById('app'));
