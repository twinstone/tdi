<?xml version="1.0"?>
<response>
<?php
if (!empty($_FILES) && isset($_FILES['fileToUpload'])) {
    switch ($_FILES['fileToUpload']["error"]) {
        case UPLOAD_ERR_OK:
            $target = "../uploads/";
            $target = $target . basename($_FILES['fileToUpload']['name']);

            if (move_uploaded_file($_FILES['fileToUpload']['tmp_name'], $target)) {
                $status = "The file " . basename($_FILES['fileToUpload']['name']) . " has been uploaded";
                $imageFileType = pathinfo($target, PATHINFO_EXTENSION);
                $check = getimagesize($target);
                if ($check !== false) {
                    $fileType = "File is an image - " . $check["mime"];
                    $uploadOk = 1;
                } else {
                    $fileType = "File is not an image.";
                    $uploadOk = 0;
                }

            } else {
                $status = "Sorry, there was a problem uploading your file.";
            }

            break;

    }
    echo "<status>OK</status>";
    echo "<message>{$status} - {$fileType}</message>";
} else {
    echo "<status>ERROR</status>";
    echo "<message>No file uploaded.</message>";
}
?>
</response>