<?php
    $inData = getRequestInfo();
    
    $searchResults = "";
    $searchCount = 0;

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) 
    {
        returnWithError($conn->connect_error);
    } 
    else
    {
        $stmt = $conn->prepare("SELECT FirstName, LastName, Phone, Email FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ?) AND UserID=?");
        
        $searchName = "%" . $inData["search"] . "%";
        $stmt->bind_param("ssi", $searchName, $searchName, $inData["userId"]);
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $searchArray = array();
        
        while($row = $result->fetch_assoc())
        {
            $searchArray[] = array(
                "firstName" => $row["FirstName"],
                "lastName" => $row["LastName"],
                "phone" => $row["Phone"],
                "email" => $row["Email"]
            );
        }
        
        if(count($searchArray) > 0)
        {
            returnWithInfo($searchArray);
        }
        else
        {
            returnWithError("No Records Found");
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
            "results" => array(),
            "error" => $err
        );
        sendResultInfoAsJson(json_encode($retArray, JSON_PRETTY_PRINT));
    }
    
    function returnWithInfo($searchArray)
    {
        $retArray = array(
            "results" => $searchArray,
            "error" => ""
        );
        sendResultInfoAsJson(json_encode($retArray, JSON_PRETTY_PRINT));
    }
?>
