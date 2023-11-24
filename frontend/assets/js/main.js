
$(function ()
{
    let today_date = new Date;
    let today_date_string = today_date.getFullYear() + "-" + (today_date.getMonth() + 1) + "-" + today_date.getDate();
    $('input[type=date]').val(today_date_string);

    $('.link_session_email').click(function()
    {
        window.location.href = "mi-perfil.html"; 
    });
});

const CheckForm = (current_form) =>
{
    // Verify forms validation
    let validity = true;

    if (!current_form.checkValidity())
    {
        validity = false;
    }

    current_form.classList.add('was-validated')

    return validity;
};

const AddNotification = (message) =>
{
    $('#notifications').append
    (`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
}
const AddNotificationBlock = (block, message) =>
{
    $(block).append
    (`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
}

const ChangeButtonToWait = (button, text, active) =>
{
    if(active)
    {
        button.removeAttribute('disabled');
        $(button).html(text);
    }
    else
    {
        button.setAttribute('disabled', '');
        $(button).html('');
        $(button).append(button_wait);
    }
}

const DownloadCSVFile = (csv, filename) =>
{
	let csv_file, download_link;

	csv_file = new Blob([csv], {type: "text/csv"});

	download_link = document.createElement("a");
	download_link.download = filename;
	download_link.href = window.URL.createObjectURL(csv_file);
	download_link.style.display = "none";
	document.body.appendChild(download_link);
	download_link.click();
    document.body.removeChild(download_link);
}

const HTMLToCSV = (table, filename) =>
{
    let data = [];
    let rows = document.querySelectorAll(`${table} tr`);

    for (let i = 0; i < rows.length; i++)
    {
        let row = [], cols = rows[i].querySelectorAll("td, th");

        for (let j = 0; j < cols.length; j++)
            row.push(cols[j].innerText);

        data.push(row.join("\t"));
	}

	DownloadCSVFile(data.join("\n"), filename);
}

var spinner_wait = 
`
    <div class="spinner_wait d-flex justify-content-center p-2">
        <div class="spinner_wait_content spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
`;

var spinner_select_wait = 
`
    <option class="d-flex justify-content-center p-2 disabled">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </option>
`;

var button_wait = 
`
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Espere...
`;
