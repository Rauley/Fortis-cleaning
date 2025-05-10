document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("booking-form");
  const messageBox = document.getElementById("bookingMessage");

  if (!form) {
    console.error("Booking form not found.");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("book-name").value.trim();
    const email = document.getElementById("book-email").value.trim();
    const service = document.getElementById("service").value.trim();
    const preferred_date = document.getElementById("date").value.trim();
    const location = document.getElementById("location").value.trim();
    const details = document.getElementById("details").value.trim();
    const token = grecaptcha.getResponse();

    if (!token) {
      alert("❌ Please complete the reCAPTCHA.");
      return;
    }

    try {
      const res = await fetch("/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, service, preferred_date, location, details, token })
      });

      const data = await res.json();

      if (res.ok) {
        messageBox.innerText = "✅ Booking request sent! We'll get back to you shortly.";
        messageBox.style.color = "green";
        messageBox.style.display = "block";
        form.reset();
        grecaptcha.reset();
      } else {
        messageBox.innerText = "❌ " + (data.message || "Something went wrong.");
        messageBox.style.color = "red";
        messageBox.style.display = "block";
      }
    } catch (err) {
      console.error("Error:", err);
      messageBox.innerText = "❌ Network error. Please try again later.";
      messageBox.style.color = "red";
      messageBox.style.display = "block";
    }
  });
});
