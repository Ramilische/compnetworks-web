import { useNavigate } from 'react-router-dom';

import './styles/Start.css'


function Start() {
    const navigate = useNavigate();

    return <>
    <div>
        <button onClick={() => navigate("/init-nodes")}>Новый проект</button>
        <button>Открыть существующий проект</button>
    </div>
    </>
}

export default Start;