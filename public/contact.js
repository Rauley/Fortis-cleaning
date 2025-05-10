document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) {
    console.error("Form not found");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const token = grecaptcha.getResponse();

    if (!token) {
      alert("❌ Please complete the reCAPTCHA.");
      return;
    }

    try {
      const res = await fetch("/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, message, token })
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Message sent successfully!");
        form.reset();
        grecaptcha.reset();
      } else {
        alert("❌ Server error: " + data.message);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("❌ Something went wrong. Please try again.");
    }
  });
});
