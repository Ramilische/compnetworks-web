import { useEffect, useState } from 'react';
import './styles/GetForms.css';

function GetNodes() {
    var backend_address = 'http://127.0.0.1:8000/';
    var method = 'init-node';
    var button_text = 'Добавить';

    const [node_name, setNodeName] = useState('');
    const [node_x, setNodeX] = useState('0.0');
    const [node_y, setNodeY] = useState('0.0');
    const [node_color, setNodeColor] = useState('#000000')

    function addNode() {
        const new_node = {
            'name': node_name,
            'x': parseFloat(node_x),
            'y': parseFloat(node_y),
            'color': node_color
        };
        useEffect(() => {
            fetch(backend_address + method, {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify(new_node)
            });
            console.log(response);
        })
        // const response = fetch(backend_address + method, {
        //     method:'POST',
        //     headers: {
        //         'Content-Type': 'application/json; charset=utf-8',
        //     },
        //     body: JSON.stringify(new_node)
        // });
        // console.log(response);
    };

    return <>
    <div>
        <label htmlFor="name">Название узла</label><br />   
        <input type="text" name="name" id="node-name-input" value={node_name} onChange={(e) => setNodeName(e.target.value)} /><br />
        
        <label htmlFor="name">Координата X</label><br />
        <input type="text" name="x" id="x-coord-input" value={node_x} onChange={(e) => setNodeX(e.target.value)}/><br />
        
        <label htmlFor="name">Координата Y</label><br />
        <input type="text" name="y" id="y-coord-input" value={node_y} onChange={(e) => setNodeY(e.target.value)} /><br />
        
        <label htmlFor="name">Цвет узла</label><br />
        <input type="color" name="color" id="optional-node-color" value={node_color} onChange={(e) => setNodeColor(e.target.value)} /><br />
        
        <input type="button" name="submit-button" value={button_text} id="submit-button" onClick={() => addNode()}/>
        
    </div>
    </>;
};

export default GetNodes;