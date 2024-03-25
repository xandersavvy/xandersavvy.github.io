function Test-Api {
    param(
        [string]$Uri,
        [string]$method,
        [string]$body
    )
    # commenting show mwthod  
    # function Show-Method {
    #     Write-Host "Select an option:"
    #     Write-Host "1. GET"
    #     Write-Host "2. POST"
    #     Write-Host "3. PUT"
    #     Write-Host "4. DELETE"
    #     $choice = Read-Host "Enter the number of Method"

    #     switch ($choice) {
    #         "1" { return "GET" }
    #         "2" { return "POST" }
    #         "3" { return "PUT" }
    #         "4" { return "DELETE" }
    #         default { return "GET" }
    #     }

    # }
    if (!(Test-Path -Path res.txt -PathType Leaf)) {
        New-Item res.txt
    }

    # $method = Show-Method
    # $Uri = Read-Host "Enter the URI Value"
    # $body = Read-Host "Enter file location of json file for body"

    #body
    if ($body.length -gt 0) {
        # Read the content of the file
        # $bodyData = Get-Content -Path $body -Raw
        #  change headers if needed
        $headers = @{
            "Content-Type" = "application/json"
        }
        # Send a POST request with the file content as the request body
        $res = Invoke-WebRequest -Uri $uri -Method $method -Headers $headers -Body $body
    }
    else {
        $res = Invoke-WebRequest -Uri $uri  -Method $method 
    }
    Add-Content -Path res.txt "request:"
    Add-Content -Path .\res.txt $body
    Add-Content -Path res.txt "response:"
    Add-Content -Path res.txt $res
}

# automate the flow

$reqs =  Get-Content -Path .\req.json -Raw | ConvertFrom-Json

forEach($i in $reqs){
    $req = $i | ConvertTo-Json
    Test-Api -Uri https://reqres.in/api/users -method Post -body $req
}

notepad .\res.txt