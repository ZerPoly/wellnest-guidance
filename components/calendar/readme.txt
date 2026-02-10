AgendaComponent.tsx - a list-view component that groups upcoming consultations into categories (today, tomorrow, this week, or all) with a sticky header for date labels.

AgendaDetailsModal.tsx - a focused view that displays the full metadata of a selected session, allowing counselors to accept or decline incoming requests.

CalendarComponent.tsx - the primary interactive grid view. it displays confirmed appointments on their respective dates and includes the navigation controls for month/year selection and the red-dot notification for pending requests.

CounselorAgendaModal.tsx - the form modal used by counselors to manually initiate and schedule new consultations for specific students.

CustomDropdown.tsx - a reusable, styled selection component used for the calendar's month and year navigation.

DayAgendasModal.tsx - a pop-up list that appears when a calendar day with multiple scheduled sessions is clicked, allowing for better visibility and selection.

PendingRequestsModal.tsx - a dedicated inbox for viewing and acting upon all student-initiated appointment requests in one place.