const apiKey = "AIzaSyDmiqEIZl5XSRBHwGIrPPNnJ9GP9xpvQgQ"; // Replace with your actual API key
const calendarId = "339cfbd36865c5e9b75afbe1c32c9c9753214d0974c3230f8400d412de937e88@group.calendar.google.com"; // Replace with your Google Calendar ID
const maxResults = 5;

const fetchEvents = async () => {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
};

const renderEvents = async () => {
    const events = await fetchEvents();
    const eventGrid = document.getElementById('eventGrid');

    const randomBackgroundImages = [
        "https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/5726809/pexels-photo-5726809.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/5940831/pexels-photo-5940831.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/2280568/pexels-photo-2280568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/2280551/pexels-photo-2280551.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/267582/pexels-photo-267582.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/954583/pexels-photo-954583.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/3735709/pexels-photo-3735709.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=600"
    ];

    if (events.length === 0) {
        eventGrid.innerHTML = `<p>No upcoming events.</p>`;
        return;
    }

    events.forEach(event => {
        const date = new Date(event.start.dateTime || event.start.date).toLocaleDateString();
        const time = new Date(event.start.dateTime || event.start.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const title = event.summary || "No Title";
        const location = event.location || "Location TBC";
        const description = event.description || "";
        const eventType = description.split(" ").slice(0, 5).join(" ") || "General Event";

        const month = new Date(event.start.dateTime || event.start.date).toLocaleString('default', { month: 'short' });
        const day = new Date(event.start.dateTime || event.start.date).getDate();

        const randomImage = randomBackgroundImages[Math.floor(Math.random() * randomBackgroundImages.length)];

        eventGrid.innerHTML += `
            <div class="event-card" style="background-image: url('${randomImage}');">
                <div class="event-date-box">
                    <div class="month">${month}</div>
                    <div class="day">${day}</div>
                </div>
                <div class="event-content">
                    <div class="event-title">${title}</div>
                    <div class="event-type">
                        <i class="bi bi-tag"></i> ${eventType}
                    </div>
                    <div class="event-time">
                        <i class="bi bi-clock"></i> ${time}
                    </div>
                    <div class="event-location">
                        <i class="bi bi-geo-alt"></i> ${location}
                    </div>
                    <button class="reserve-btn" onclick="openReservationModal('${title}')">Reserve</button>
                </div>
            </div>`;
    });
};

const openReservationModal = (eventTitle) => {
    const modal = new bootstrap.Modal(document.getElementById('bookingModal')); // Initialize the modal
    document.getElementById('eventTitleInput').value = eventTitle; // Populate event title
    modal.show(); // Show the modal
};

window.onload = renderEvents;
