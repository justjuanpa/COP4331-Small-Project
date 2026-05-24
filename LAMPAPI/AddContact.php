<?php
    $inData = getRequestInfo();
    
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $phone = $inData["phone"];
    $email = $inData["email"];
    $userId = $inData["userId"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) 
    {
        returnWithError($conn->connect_error);
    } 
    else
    {
        
        $stmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Phone, Email, UserID) VALUES(?,?,?,?,?)");
        $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);
        
        if ($stmt->execute())
        {
            returnWithError(""); // Success!
        }
        else
        {
            returnWithError("Failed to add contact.");
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
