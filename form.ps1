Add-Type -AssemblyName System.Windows.Forms

# Create a form
$form = New-Object Windows.Forms.Form
$form.Text = "Input Dialog"
$form.Size = New-Object Drawing.Size(300, 150)
$form.StartPosition = "CenterScreen"

# Create a label
$label = New-Object Windows.Forms.Label
$label.Text = "Enter your name:"
$label.Location = New-Object Drawing.Point(20, 20)

# Create a text box
$textBox = New-Object Windows.Forms.TextBox
$textBox.Location = New-Object Drawing.Point(20, 50)
$textBox.Size = New-Object Drawing.Size(260, 25)

# Create an OK button
$okButton = New-Object Windows.Forms.Button
$okButton.Text = "OK"
$okButton.Location = New-Object Drawing.Point(100, 90)
$okButton.DialogResult = [Windows.Forms.DialogResult]::OK

# Add controls to the form
$form.Controls.Add($label)
$form.Controls.Add($textBox)
$form.Controls.Add($okButton)

# Display the form
$result = $form.ShowDialog()

# Check if the OK button was clicked
if ($result -eq [Windows.Forms.DialogResult]::OK) {
    $userInput = $textBox.Text
    Write-Host "You entered: $userInput"
}

# Clean up
$form.Dispose()
