<?php
// send_consultation_request.php

header("Access-Control-Allow-Origin: *"); // Adjust for production: your domain
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- CONFIGURATION ---
$recipient_email = "info@kershawlaw.com"; // Where consultation requests are sent
$email_subject_prefix = "New Consultation Request";
$from_email_address = "noreply@kershawlaw.com"; // 'From' address for the email

// --- SCRIPT LOGIC ---
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON payload."]);
        exit;
    }
     if (!is_array($data)) {
         http_response_code(400);
        echo json_encode(["status" => "error", "message" => "JSON data must be an object."]);
        exit;
    }

    // --- Sanitize and Validate Data ---
    $full_name = isset($data['full-name']) ? trim(strip_tags($data['full-name'])) : '';
    $company_name = isset($data['company-name']) ? trim(strip_tags($data['company-name'])) : '';
    $email = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';
    $phone = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
    $position_title = isset($data['position-title']) ? trim(strip_tags($data['position-title'])) : '';
    $worker_count = isset($data['worker-count']) ? filter_var($data['worker-count'], FILTER_SANITIZE_NUMBER_INT) : '';
    $visa_type_raw = isset($data['visa-type']) ? trim(strip_tags($data['visa-type'])) : '';
    $job_duties = isset($data['job-duties']) ? trim(strip_tags($data['job-duties'])) : '';
    $message = isset($data['message']) ? trim(strip_tags($data['message'])) : 'Not provided';
    $referral_source_raw = isset($data['referral-source']) ? trim(strip_tags($data['referral-source'])) : '';

    // --- Map select values to human-readable strings ---
    $visa_type_map = [
        "h2a" => "H-2A (Agricultural)",
        "h2b" => "H-2B (Non-Agricultural)",
        "both_unsure" => "Both / Unsure"
    ];
    $visa_type = isset($visa_type_map[$visa_type_raw]) ? $visa_type_map[$visa_type_raw] : ($visa_type_raw ?: 'Not specified');

    $referral_source_map = [
        "website_search" => "Website / Search Engine (Google, etc.)",
        "referral_colleague" => "Referral (Colleague/Friend)",
        "industry_association" => "Industry Association",
        "social_media" => "Social Media",
        "advertisement" => "Advertisement",
        "event_conference" => "Event/Conference",
        "previous_client" => "Previous Client",
        "other_referral" => "Other"
    ];
    $referral_source = isset($referral_source_map[$referral_source_raw]) ? $referral_source_map[$referral_source_raw] : ($referral_source_raw ?: 'Not specified');

    // --- Validation for required fields ---
    $errors = [];
    if (empty($full_name)) $errors[] = "Full Name is required.";
    if (empty($company_name)) $errors[] = "Company Name is required.";
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "A valid Email Address is required.";
    if (empty($phone)) $errors[] = "Phone Number is required."; // Phone is now required
    if (empty($position_title)) $errors[] = "Position/Job Title is required.";
    if (empty($worker_count) || !filter_var($worker_count, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]])) $errors[] = "Approx. Workers Needed must be a number greater than 0.";
    if (empty($visa_type_raw)) $errors[] = "Primary Visa Type is required.";
    if (empty($job_duties)) $errors[] = "Brief Description of Job Duties is required.";
    if (empty($referral_source_raw)) $errors[] = "How Did You Hear About Us? is required.";


    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Please correct the following errors: " . implode(" ", $errors),
            "errors" => $errors // Optionally send individual error messages
        ]);
        exit;
    }

    // --- Email Construction ---
    $email_subject = "$email_subject_prefix: $company_name - $full_name";
    $email_body = "New Consultation Request Details:\n\n";
    $email_body .= "Full Name: $full_name\n";
    $email_body .= "Company Name: $company_name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Phone Number: $phone\n";
    $email_body .= "Position/Job Title: $position_title\n";
    $email_body .= "Approx. Workers Needed: $worker_count\n";
    $email_body .= "Primary Visa Type Needed: $visa_type\n";
    $email_body .= "Brief Description of Job Duties:\n$job_duties\n\n";
    $email_body .= "Additional Details/Questions:\n$message\n\n";
    $email_body .= "How Did You Hear About Us?: $referral_source\n\n";
    $email_body .= "--------------------------------------------------\n";
    $email_body .= "Client IP Address: " . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'N/A') . "\n";
    $email_body .= "Timestamp: " . date("Y-m-d H:i:s T") . "\n";
    $email_body .= "--- End of Message ---";

    $headers = "From: \"" . preg_replace("/[^A-Za-z0-9 \-]/", '', $full_name) . "\" <" . $from_email_address . ">\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    $headers .= "MIME-Version: 1.0\r\n";

    $additional_parameters = "-f" . $from_email_address;

    if (mail($recipient_email, $email_subject, $email_body, $headers, $additional_parameters)) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Thank you for your request! We have received your details and will be in touch shortly to schedule your consultation."
        ]);
    } else {
        http_response_code(500);
        error_log("Consultation Mail failed. To: $recipient_email, From: $from_email_address, Reply-To: $email, Subject: $email_subject");
        echo json_encode([
            "status" => "error",
            "message" => "Sorry, there was an error sending your consultation request. Please try again later or contact us directly."
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>