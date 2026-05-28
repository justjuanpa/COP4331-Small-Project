<?php
$inData = getRequestInfo();

$contactId = $inData["contactId"];
$userId    = $inData["userId"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
  returnWithError($conn->connect_error);
}
else
{
  // Only delete if the contact belongs to the requesting user
  $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND UserID=?");
  $stmt->bind_param("ii", $contactId, $userId);

  if ($stmt->execute())
  {
    if ($stmt->affected_rows > 0)
    {
      returnWithError("");
    }
    else
    {
      returnWithError("Contact not found or access denied.");
    }
  }
  else
  {
    returnWithError("Failed to delete contact.");
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
