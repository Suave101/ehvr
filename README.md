# Emerald Horizon Resorts

### [Click Here to visit the live preview](https://ehvr.vercel.app/)

![main](https://github.com/user-attachments/assets/21d140ad-8cbb-417b-ae54-6e1f6622af84)
> Here is a screenshot of the Front Page of the Website

![image](https://github.com/user-attachments/assets/d605f3ff-928b-40f1-ba1b-5481d999efaa)
> Here is a screenshot of the Featured Accomodations part of the Accomodations Page

![image](https://github.com/user-attachments/assets/9fb15635-7a8b-4ff0-80cd-3018db7b2ddc)
> Here is a screenshot of the Additional Acommodations part of the Accomodations Page

![image](https://github.com/user-attachments/assets/17d88217-5c52-438e-bd99-3e1bae568de1)
> For sales purposes, suites and higher tiered rooms are highlighted gold

# Application Schema
![image](https://github.com/user-attachments/assets/43160d15-fa79-4a16-838c-9690b9c75748)

> This report outlines the proposed database structure for our hotel room booking system, designed to serve as the robust foundation for managing our properties, room inventory, and guest reservations. It's built to ensure efficiency, accuracy, and scalability, directly impacting our operational effectiveness and guest satisfaction.

### Understanding Our Data Foundation

At its core, this system organizes all critical information about our hotel operations into distinct, interconnected components. Think of it as the central nervous system that allows us to manage everything from individual rooms to complex booking schedules.

**Here are the key components and their business significance:**

1.  **Hotels (`hotels` table):**
    * **Business Purpose:** This is our master list of all hotel properties we operate, such as the Amara, Bonita, and Cordova Hotels. It holds essential details like each hotel's name, address, and a general description.
    * **Value to Business:** Provides a clear, centralized record of our assets, enabling consistent management across all locations.

2.  **Room Categories (`room_types` table):**
    * **Business Purpose:** This defines the various types of rooms we offer (e.g., 'Oceanfront King', 'Deluxe Double Queen'). It standardizes details like base pricing, maximum occupancy, and amenities for each category.
    * **Value to Business:** Ensures consistent pricing and service levels for similar rooms, simplifies rate management, and helps us market specific room features effectively.

3.  **Individual Rooms (`rooms` table):**
    * **Business Purpose:** This is our precise inventory of every single physical room in our hotels (e.g., "Room 101," "Suite A"). Each room is linked to its specific category and can be marked as active or inactive.
    * **Value to Business:** Provides real-time, granular control over our exact room inventory, essential for accurate availability and preventing overbooking.

4.  **Guest Bookings (`reservations` table):**
    * **Business Purpose:** This is where we record every guest's booking. It captures who booked, for which room, check-in and check-out dates, total price, number of guests, and the current status of their reservation (e.g., confirmed, pending, cancelled).
    * **Value to Business:** Serves as the core record for all guest stays, enabling efficient check-in/out, billing, and guest communication.

5.  **Operational Blockouts (`room_blockout_dates` table):**
    * **Business Purpose:** This is a critical feature for managing non-bookable periods for individual rooms. It allows us to mark specific dates when a room is unavailable for reasons like maintenance, renovation, or special owner use, completely separate from guest bookings.
    * **Value to Business:** Prevents accidental bookings of unavailable rooms, streamlines maintenance scheduling, and ensures operational efficiency by clearly defining room status.

### How We Ensure Room Availability (The Core Logic)

A key strength of this database structure is its intelligent approach to determining room availability. When a potential guest searches for a room for specific dates, the system performs a rapid check:

* It confirms the room is marked as **active** in our inventory.
* It verifies there are **no existing guest reservations** that overlap with the requested dates.
* Crucially, it checks that there are **no planned operational blockouts** for that specific room within the desired period.

This integrated approach ensures that we only offer rooms that are genuinely available, preventing frustrating overbookings and maintaining guest satisfaction.

### Strategic Business Benefits

This database schema provides several significant advantages for our hotel operations:

* **Enhanced Operational Efficiency:** Streamlines the entire booking process, from inventory management to guest check-in, reducing manual errors and staff workload.
* **Optimized Revenue:** Accurate, real-time availability data allows us to maximize occupancy and enables future implementation of dynamic pricing strategies based on demand.
* **Superior Guest Experience:** Guests can book with confidence, knowing their chosen room will be available and ready, leading to higher satisfaction and repeat business.
* **Robust Data Integrity:** The structured design minimizes data inconsistencies, providing a reliable source of truth for all hotel operations and reporting.
* **Scalability for Growth:** This flexible foundation is designed to easily accommodate future expansion, whether we add more rooms, new room types, or even additional hotel properties.

In essence, this database schema is more than just a technical blueprint; it's a strategic asset that underpins our ability to operate efficiently, serve our guests effectively, and drive business growth.
# Planned Features

## Core Functionality & Guest Experience

---

### Paginate View Rooms
Display available rooms in manageable pages for better performance and easier browsing.

### Lazy Load Rooms
Optimize loading times by only loading images and details as they enter the user's viewport.

### Put Real Rooms Into System
Populate the database with actual hotel room inventory, including unique numbers, types, and statuses.

### Create Details Page
Provide a dedicated page for each room or room type, featuring high-res images, amenities, pricing, and a clear booking call-to-action.

### Create Payment Page
Securely process guest payments with robust integration to payment gateways, handling all transaction steps and errors.

### Create Dining Page
Showcase hotel dining options, menus, hours, and promotions to encourage on-site dining.

### Create Meetings Page
Highlight meeting and event spaces, with details on capacity, equipment, catering, and booking inquiries.

### Create Gallery Page
A visually engaging gallery of rooms, amenities, and local attractions, using high-quality photos and videos.

### Add Phone Capability
Integrate click-to-call and/or softphone features for guest and staff communication.

### Make Book Now Button in Header Work
Ensure the main call-to-action button initiates the booking process or opens the booking form.

---

## Internal Operations & Staff Management

---

### Add Admin Page
Central control panel for managing users, rooms, pricing, reservations, and system settings.

### Add Front Desk Page
Specialized interface for check-ins/outs, room assignments, payments, and guest inquiries.

### Add Cleaning Lady Page (Add Español Option)
Housekeeping dashboard for room assignments, cleaning status, and maintenance reporting, with Spanish language support.

### Add Maintenance Page
Manage repair requests, routine tasks, and maintenance status updates for all rooms.

### Develop Check-In Kiosk
Self-service solution for guest check-in/out, room selection, digital keys, and payments.

---

## Advanced Business Intelligence & Management

---

### Implement Business Logic to Analyze Trends and Recommend Rates
Use analytics to optimize pricing based on demand, events, and competitor rates.

### Integrate Calendar for Room Availability
Visual calendar for real-time room availability, bookings, and assignments.

### Add User Role Management
Define and assign user roles (Admin, Front Desk, Housekeeping, Guest) with specific permissions.

### Implement Notification System (Email/SMS)
Automate guest and staff alerts for bookings, reminders, and urgent messages.

### Add Reporting and Analytics Dashboard
Centralized dashboard for KPIs: occupancy, revenue, sources, demographics, and efficiency.

### Enable Full Multi-language Support
Allow users to select their preferred language for the entire interface.

### Improve Accessibility (WCAG Compliance)
Ensure usability for people with disabilities: keyboard navigation, screen reader support, and color contrast.

### Add Dark Mode Option
Allow users to switch to a dark color scheme for comfort and battery savings.

### Implement Two-Factor Authentication
Enhance security with two-step login (password + code).

### Integrate Payment Gateways
Connect to Stripe, PayPal, etc., for secure, global payment processing.

### Add API for Third-Party Integrations
Enable OTAs (Booking.com, Expedia) to sync availability, rates, and bookings.

### Enable Real-Time Chat Support
Live chat widget for instant guest support and engagement.

### Add Feedback and Review System
Collect guest feedback and ratings for continuous improvement.

### Optimize for Mobile Devices
Ensure a fully responsive, touch-friendly experience on all devices.

### Implement Backup and Restore Functionality
Regularly back up data and provide restore options for business continuity.

### Add Audit Log for User Actions
Track all significant user actions for security and troubleshooting.

### Add Customizable Email Templates
Allow staff to create and personalize branded email communications.

### Integrate with Accounting Software
Automate financial data transfer to platforms like QuickBooks or Xero.

### Add Automated Invoice Generation
Automatically generate and send invoices for guest payments.

### Enable Push Notifications (Web/Mobile)
Send real-time alerts to staff and guests on any device.

### Implement Single Sign-On (SSO) Support
Allow users to access multiple systems with one set of credentials.

### Add Loyalty/Rewards Program Management
Manage guest loyalty programs, points, tiers, and personalized offers.

### Integrate Digital Key/Card System
Enable smartphone or key card access to rooms, integrated with the front desk.

### Add Guest Self-Service Portal
Let guests manage bookings, check-in, view bills, and interact with services online.

### Add Multi-Property Management Support
Manage multiple hotels or properties from a single dashboard.

### Integrate with IoT Devices (Smart Locks, Thermostats)
Connect to smart devices for remote control and enhanced guest experience.

### Enable Bulk Data Import/Export
Easily import/export large datasets for migration or analysis.

### Add Custom Report Builder
Allow users to design and generate specialized reports.

### Implement GDPR/CCPA Compliance Tools
Support data privacy regulations with consent management and data requests.

### Add Custom Branding/Theming Options
Customize the system's appearance to match hotel branding.

### Integrate with Social Media Platforms
Automate promotions, share reviews, and enable direct bookings from social media.

### Add Staff Scheduling and Shift Management
Create and manage staff schedules, shifts, and time-off requests.

### Implement Escalation Workflows for Issues
Automate escalation of unresolved issues to management for timely resolution.
