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
		document.getElementById("userName").innerHTML = "Welcome, " + firstName + " " + lastName;
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
					contactList.innerHTML = '<tr><td colspan="5" class="emptyState">No contacts found.</td></tr>';
					contactSearchResult.innerHTML = jsonObject.error || "";
					return;
				}

				let rows = "";
				for (let i = 0; i < contacts.length; i++)
				{
					let contact = contacts[i];
					rows += "<tr id='row-" + contact.id + "'>";
					rows += "<td id='name-" + contact.id + "'>" + escapeHtml(contact.firstName + " " + contact.lastName) + "</td>";
					rows += "<td id='phone-" + contact.id + "'>" + escapeHtml(contact.phone) + "</td>";
					rows += "<td id='email-" + contact.id + "'>" + escapeHtml(contact.email) + "</td>";
					rows += "<td>" + escapeHtml(contact.dateCreated) + "</td>";
					rows += "<td>";
					rows += "<div class='actionButtons'>";
					rows += "<button type='button' class='editButton' onclick='editContact(" 
						+ contact.id + ",\"" 
						+ escapeHtml(contact.firstName) + "\",\"" 
						+ escapeHtml(contact.lastName) + "\",\"" 
						+ escapeHtml(contact.phone) + "\",\"" 
						+ escapeHtml(contact.email) 
						+ "\")'>Edit</button>";
					rows += "<button type='button' class='deleteButton' onclick='deleteContact(" 
						+ contact.id 
						+ ")'>Delete</button>";
					rows += "</div>";
					rows += "</td>";
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

function editContact(id, firstName, lastName, phone, email)
{
	document.getElementById("name-" + id).innerHTML =
		"<input id ='editFirst-" + id + "' value='" + firstName + "'>" + 
		"<input id ='editLast-" + id + "' value='" + lastName + "'>";

	document.getElementById("phone-" + id).innerHTML =
		"<input id='editPhone-" + id + "' value='" + phone + "'>";
	
	document.getElementById("email-" + id).innerHTML =
		"<input id='editEmail-" + id + "' value='" + email + "'>";

	let row = document.getElementById("row-" + id);

	row.cells[4].innerHTML = 
		"<div class='actionButtons'>" +
		"<button type='button' class='editButton' onclick='saveContact(" + id + ")'>Save</button>" +
		"<button type='button' class='deleteButton' onclick='searchContacts()'>Cancel</button>" +
		"</div>";
}

function saveContact(contactId)
{
	let firstName = document.getElementById("editFirst-" + contactId).value;

	let lastName = document.getElementById("editLast-" + contactId).value;

	let phone = document.getElementById("editPhone-" + contactId).value;

	let email = document.getElementById("editEmail-" + contactId).value;

	let tmp =
	{
		contactId: contactId,
		firstName: firstName,
		lastName: lastName,
		phone: phone,
		email: email,
		userId: userId
	};

	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + "/UpdateContact." + extension;

	let xhr = new XMLHttpRequest();

	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function()
	{
		if(this.readyState == 4 && this.status == 200)
		{
			searchContacts();
		}
	};

	xhr.send(jsonPayload);
}

function deleteContact(contactId)
{
	if(!confirm("Are you sure you want to delete this contact?"))
	{
		return;
	}

	let tmp =
	{
		contactId: contactId,
		userId: userId
	};

	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + "/DeleteContact." + extension;

	let xhr = new XMLHttpRequest();

	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function()
	{
		if(this.readyState == 4 && this.status == 200)
		{
			searchContacts();
		}
	};

	xhr.send(jsonPayload);

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