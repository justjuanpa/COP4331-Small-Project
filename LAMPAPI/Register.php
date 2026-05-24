<?php
    $inData = getRequestInfo();
    
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $login = $inData["login"];
    $password = $inData["password"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    if ($conn->connect_error) 
    {
        returnWithError($conn->connect_error);
    } 
    else
    {
        // Prevent duplicate usernames
        $stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
        $stmt->bind_param("s", $login);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0)
        {
            returnWithError("Username is already taken.");
        }
        else
        {
            $stmt = $conn->prepare("INSERT into Users (FirstName, LastName, Login, Password) VALUES(?,?,?,?)");
            $stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
            
            if ($stmt->execute())
            {
                returnWithError(""); // Success with blank error!
            }
            else
            {
                returnWithError("Failed to register user.");
            }
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
        // Automatically outputs beautiful, clean spacing on separate lines
        $retArray = array(
            "error" => $err
        );
        sendResultInfoAsJson(json_encode($retArray, JSON_PRETTY_PRINT));
    }
?>
