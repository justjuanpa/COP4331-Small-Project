<?php
$inData = getRequestInfo();

$contactId = $inData["contactId"];
$firstName = $inData["firstName"];
$lastName  = $inData["lastName"];
$phone     = $inData["phone"];
$email     = $inData["email"];
$userId    = $inData["userId"]; // Used to verify ownership

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
  returnWithError($conn->connect_error);
}
else
{
  // Only update if the contact belongs to the requesting user
  $stmt = $conn->prepare(
    "UPDATE Contacts
    SET FirstName=?, LastName=?, Phone=?, Email=?
    WHERE ID=? AND UserID=?"
  );
  $stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $contactId, $userId);

  if ($stmt->execute())
  {
    if ($stmt->affected_rows > 0)
    {
      returnWithError(""); // Success
    }
    else
    {
      // Either the contact doesn't exist or belongs to a different user
      returnWithError("Contact not found or access denied.");
    }
  }
  else
  {
    returnWithError("Failed to update contact.");
  }

  $stmt->close();
  $conn->close();
}

function getRequestInfo()
{
  return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
  header('Content-type: application/json');
  echo $obj;
}

function returnWithError($err)
{
  $retArray = array(
    "error" => $err
  );
  sendResultInfoAsJson(json_encode($retArray, JSON_PRETTY_PRINT));
}
?>
