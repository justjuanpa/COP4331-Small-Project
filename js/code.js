const urlBase = 'http://cop4331-2004.online/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact()
{
	let contactFirstName = document.getElementById("contactFirstName").value.trim();
	let contactLastName = document.getElementById("contactLastName").value.trim();
	let contactPhone = document.getElementById("contactPhone").value.trim();
	let contactEmail = document.getElementById("contactEmail").value.trim();

	//remove nondigits from phone
	let digitsOnly = contactPhone.replace(/\D/g, "");
	//must be 10 digits
	if(digitsOnly.length != 10)
	{
		document.getElementById("contactAddResult").innerHTML = "Phone number must be exactly 10 digits";
		return;
	}

	//email validation
	let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if(!emailPattern.test(contactEmail))
	{
		document.getElementById("contactAddResult").innerHTML = "Please enter a valid email address";
		return;
	}

	document.getElementById("contactAddResult").innerHTML = "";

	let tmp = {
		firstName: contactFirstName,
		lastName: contactLastName,
		phone: contactPhone,
		email: contactEmail,
		userId: userId
	};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/AddContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse(xhr.responseText);
				if (jsonObject.error && jsonObject.error.length > 0)
				{
					document.getElementById("contactAddResult").innerHTML = jsonObject.error;
					return;
				}

				document.getElementById("addContactForm").reset();
				document.getElementById("contactAddResult").innerHTML = "Contact has been added.";
				searchContacts();
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}
}

function searchContacts()
{
	let searchInput = document.getElementById("contactSearchText");
	let srch = searchInput ? searchInput.value.trim() : "";
	let contactList = document.getElementById("contactList");
	let contactSearchResult = document.getElementById("contactSearchResult");

	if (!contactList || userId < 1)
	{
		return;
	}

	contactSearchResult.innerHTML = "";

	let tmp = {search: srch, userId: userId};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/SearchContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse(xhr.responseText);
				let contacts = jsonObject.results || [];

				if (contacts.length < 1)
				{
					contactList.innerHTML = '<tr><td colspan="3" class="emptyState">No contacts found.</td></tr>';
					contactSearchResult.innerHTML = jsonObject.error || "";
					return;
				}

				let rows = "";
				for (let i = 0; i < contacts.length; i++)
				{
					let contact = contacts[i];
					rows += "<tr>";
					rows += "<td>" + escapeHtml(contact.firstName + " " + contact.lastName) + "</td>";
					rows += "<td>" + escapeHtml(contact.phone) + "</td>";
					rows += "<td>" + escapeHtml(contact.email) + "</td>";
					rows += "<td>" + escapeHtml(contact.dateCreated) + "</td>";
					rows += "</tr>";
				}

				contactList.innerHTML = rows;
				contactSearchResult.innerHTML = contacts.length + " contact(s) found.";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		contactSearchResult.innerHTML = err.message;
	}
}

function escapeHtml(value)
{
	return String(value || "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
