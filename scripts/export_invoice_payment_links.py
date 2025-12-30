"""
Export Invoice Payment Links from Firebase
Retrieves all invoices with payment links for sending correction emails
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Try to get existing app
        app = firebase_admin.get_app()
        print("Using existing Firebase app")
    except ValueError:
        # Initialize new app
        cred = credentials.Certificate('path/to/serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
        print("Initialized new Firebase app")
    
    return firestore.client()

def get_all_invoices_with_payment_links(db):
    """Retrieve all invoices that have Stripe payment links"""
    print("\nRetrieving invoices from Firebase...")
    
    # Get all invoices
    invoices_ref = db.collection('handyworks_invoices')
    invoices = invoices_ref.stream()
    
    invoice_data = []
    
    for invoice_doc in invoices:
        invoice = invoice_doc.to_dict()
        invoice['id'] = invoice_doc.id
        
        # Only include invoices with payment links
        if invoice.get('stripe_payment_link_url'):
            invoice_data.append({
                'id': invoice_doc.id,
                'invoice_id': invoice.get('invoice_id', 'N/A'),
                'acct_num': invoice.get('acct_num', 'N/A'),
                'customer_name': invoice.get('customer_name', 'N/A'),
                'customer_email': invoice.get('customer_email', 'N/A'),
                'year': invoice.get('year', 'N/A'),
                'amount': invoice.get('amount', 0),
                'payment_status': invoice.get('payment_status', 'N/A'),
                'stripe_payment_link_url': invoice.get('stripe_payment_link_url', ''),
                'created_at': invoice.get('created_at'),
            })
    
    print(f"Found {len(invoice_data)} invoices with payment links")
    return invoice_data

def get_user_info(db, acct_num):
    """Get user information from handyworks_users collection"""
    try:
        users_ref = db.collection('handyworks_users')
        query = users_ref.where('acct_num', '==', acct_num).limit(1)
        users = list(query.stream())
        
        if users:
            user = users[0].to_dict()
            return {
                'name': user.get('name', 'N/A'),
                'email': user.get('email', 'N/A'),
                'clinic': user.get('clinic', 'N/A')
            }
    except Exception as e:
        print(f"Error getting user info for {acct_num}: {e}")
    
    return None

def extract_lastname(full_name):
    """Extract last name from full name"""
    if not full_name or full_name == 'N/A':
        return 'Customer'
    
    parts = full_name.split()
    return parts[-1] if parts else 'Customer'

def generate_email_template(invoice, user_info=None):
    """Generate email template for each invoice"""
    lastname = extract_lastname(invoice['customer_name'])
    payment_url = invoice['stripe_payment_link_url']
    
    # Create plain text version
    plain_text = f"""Dear Dr. {lastname},

Our invoice had an incomplete payment link to Stripe.

Here is the correct link: {payment_url}

We apologize for the inconvenience.

Best regards,
Dr. Steve"""
    
    # Create HTML version with embedded link
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .payment-link {{
            display: inline-block;
            background-color: #008080;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 10px 0;
        }}
        .payment-link:hover {{
            background-color: #006666;
        }}
    </style>
</head>
<body>
    <p>Dear Dr. {lastname},</p>
    
    <p>Our invoice had an incomplete payment link to Stripe.</p>
    
    <p>Here is the correct link:</p>
    <p><a href="{payment_url}" class="payment-link">Click here to pay via Stripe</a></p>
    
    <p>We apologize for the inconvenience.</p>
    
    <p>Best regards,<br>
    Dr. Steve</p>
</body>
</html>"""
    
    return {
        'plain_text': plain_text,
        'html': html
    }

def main():
    """Main function to export invoice payment links"""
    print("=" * 60)
    print("Invoice Payment Link Export Tool")
    print("=" * 60)
    
    # Initialize Firebase
    db = initialize_firebase()
    
    # Get all invoices with payment links
    invoices = get_all_invoices_with_payment_links(db)
    
    if not invoices:
        print("\nNo invoices with payment links found.")
        return
    
    # Generate email templates for each invoice
    print("\nGenerating email templates...")
    
    results = []
    for invoice in invoices:
        # Get user info if available
        user_info = get_user_info(db, invoice['acct_num'])
        
        # Generate email template
        email_template = generate_email_template(invoice, user_info)
        
        results.append({
            'invoice_id': invoice['invoice_id'],
            'acct_num': invoice['acct_num'],
            'customer_name': invoice['customer_name'],
            'customer_email': invoice['customer_email'],
            'lastname': extract_lastname(invoice['customer_name']),
            'year': invoice['year'],
            'amount': invoice['amount'],
            'payment_status': invoice['payment_status'],
            'payment_link': invoice['stripe_payment_link_url'],
            'email_plain_text': email_template['plain_text'],
            'email_html': email_template['html']
        })
    
    # Save to JSON file
    output_file = 'invoice_payment_links_export.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Exported {len(results)} invoices to {output_file}")
    
    # Create a summary CSV for easy viewing
    csv_file = 'invoice_payment_links_summary.csv'
    with open(csv_file, 'w', encoding='utf-8') as f:
        f.write('Invoice ID,Account #,Customer Name,Last Name,Email,Year,Amount,Status,Payment Link\n')
        for r in results:
            f.write(f'"{r["invoice_id"]}",{r["acct_num"]},"{r["customer_name"]}","{r["lastname"]}","{r["customer_email"]}",{r["year"]},{r["amount"]},"{r["payment_status"]}","{r["payment_link"]}"\n')
    
    print(f"✅ Created summary CSV: {csv_file}")
    
    # Create individual email files
    print("\nCreating individual email files...")
    import os
    os.makedirs('correction_emails', exist_ok=True)
    
    for r in results:
        # Save plain text version
        txt_file = f'correction_emails/{r["acct_num"]}_{r["year"]}_correction.txt'
        with open(txt_file, 'w', encoding='utf-8') as f:
            f.write(f"To: {r['customer_email']}\n")
            f.write(f"Subject: HandyWorks Invoice - Corrected Payment Link\n\n")
            f.write(r['email_plain_text'])
        
        # Save HTML version
        html_file = f'correction_emails/{r["acct_num"]}_{r["year"]}_correction.html'
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(r['email_html'])
    
    print(f"✅ Created {len(results)} email files in correction_emails/ folder")
    
    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total invoices with payment links: {len(results)}")
    print(f"\nBreakdown by status:")
    status_counts = {}
    for r in results:
        status = r['payment_status']
        status_counts[status] = status_counts.get(status, 0) + 1
    
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")
    
    print("\nFiles created:")
    print(f"  - {output_file} (full data)")
    print(f"  - {csv_file} (summary)")
    print(f"  - correction_emails/ folder ({len(results)} email files)")
    
    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("1. Review the CSV file to see all customers")
    print("2. Check the correction_emails/ folder for individual email templates")
    print("3. Copy/paste each email to send to customers")
    print("4. Or use the JSON file to automate sending via Gmail API")

if __name__ == '__main__':
    main()
