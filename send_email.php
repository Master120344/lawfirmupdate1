<?php
// send_email.php

// Allow requests from any origin (for development). For production, you might want to restrict this
// to your specific domain, e.g., header("Access-Control-Allow-Origin: https://www.kershawlaw.com");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept"); // Added Accept

// Handle preflight OPTIONS request (for CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- CONFIGURATION ---
$recipient_email = "info@kershawlaw.com"; // inquiries will be sent TO this email
$email_subject_prefix = "Website Contact Form Inquiry";
$from_email_address = "noreply@kershawlaw.com"; // The email address for the 'From' header

// --- SCRIPT LOGIC ---

// Check if it's a POST request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get JSON data posted from JavaScript
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // Check if JSON decoding was successful and data is an array
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400); // Bad Request
        echo json_encode([
            "status" => "error",
            "message" => "Invalid JSON payload."
        ]);
        exit;
    }
    if (!is_array($data)) {
         http_response_code(400); // Bad Request
        echo json_encode([
            "status" => "error",
            "message" => "JSON data must be an object."
        ]);
        exit;
    }


    // --- Basic Validation & Sanitization ---
    $name = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
    $email = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';
    $phone = isset($data['phone']) ? trim(strip_tags($data['phone'])) : 'Not provided';
    $service_raw = isset($data['service']) ? trim(strip_tags($data['service'])) : '';
    $message = isset($data['message']) ? trim(strip_tags($data['message'])) : '';

    // Convert service value to a more readable format for the email
    $service_map = [
        "h2a_visa" => "H-2A Visa (Agricultural)",
        "h2b_visa" => "H-2B Visa (Non-Agricultural)",
        "initial_consultation" => "Initial Consultation",
        "general_inquiry" => "General Inquiry",
        "other_service" => "Other"
    ];
    $service = isset($service_map[$service_raw]) ? $service_map[$service_raw] : ($service_raw ?: 'Not specified');


    // Basic validation for required fields
    if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($service_raw) || empty($message)) {
        http_response_code(400); // Bad Request
        echo json_encode([
            "status" => "error",
            "message" => "Please fill out all required fields correctly."
        ]);
        exit;
    }

    // --- Email Construction ---
    $email_subject = "$email_subject_prefix: $name - $service";

    $email_body = "You have received a new message from your website contact form:\n\n";
    $email_body .= "Name: $name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Phone: $phone\n";
    $email_body .= "Service Needed: $service\n"; // Use the mapped service name
    $email_body .= "Message:\n$message\n\n";
    $email_body .= "--------------------------------------------------\n";
    $email_body .= "This email was sent from the contact form on your website.\n";
    $email_body .= "Client IP Address: " . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'N/A') . "\n";
    $email_body .= "Timestamp: " . date("Y-m-d H:i:s T") . "\n";
    $email_body .= "--- End of Message ---";

    // Headers
    // The "From" header should ideally be an address on your domain to avoid spam filters.
    // The name part can be the sender's name.
    // The $email (from the form) is used in Reply-To so you can directly reply to the user.
    $headers = "From: \"" . preg_replace("/[^A-Za-z0-9 \-]/", '', $name) . "\" <" . $from_email_address . ">\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    $headers .= "MIME-Version: 1.0\r\n"; // Good practice

    // --- Send Email ---
    // The fifth parameter "-f" can sometimes help with deliverability by setting the envelope sender.
    // This might not work on all servers or might be overridden by server configuration.
    $additional_parameters = "-f" . $from_email_address;

    if (mail($recipient_email, $email_subject, $email_body, $headers, $additional_parameters)) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Message sent successfully! We will get back to you soon."
        ]);
    } else {
        // This error often indicates a server configuration issue with mail sending
        http_response_code(500); // Internal Server Error
        error_log("Mail failed to send. To: $recipient_email, From Header: $from_email_address, Reply-To: $email, Subject: $email_subject"); // Log for server admin
        echo json_encode([
            "status" => "error",
            "message" => "Sorry, there was an error sending your message. Please try again later or contact us directly by phone or email."
        ]);
    }

} else {
    // Not a POST request
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request method. Please use POST."
    ]);
}
?>