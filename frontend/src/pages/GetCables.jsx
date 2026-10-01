import './styles/GetForms.css'


function GetCables() {
    return <>
    <div>
        <form action="get" class="get-nodes-form">
            <input type="text" name="name" id="cable-name-input" />
            <input type="text" name="speed" id="speed-input" />
            <input type="text" name="cost" id="cost-input" />
            <input type="color" name="optional-cable-color" id="cable-color" />
            <input type="button" value="" />
        </form>
    </div>
    </>
}

export default GetCables;