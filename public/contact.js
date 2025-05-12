document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const messageBox = document.getElementById("formMessage");

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
    const submitBtn = form.querySelector("button[type='submit']");

    if (!token) {
      alert("❌ Please complete the reCAPTCHA.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Processing...";

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
        messageBox.innerText = "✅ Message sent successfully!";
        messageBox.style.color = "green";
        messageBox.style.display = "block";
        form.reset();
        grecaptcha.reset();
      } else {
        messageBox.innerText = "❌ Server error: " + data.message;
        messageBox.style.color = "red";
        messageBox.style.display = "block";
      }
    } catch (err) {
      console.error("Error sending message:", err);
      messageBox.innerText = "❌ Something went wrong. Please try again.";
      messageBox.style.color = "red";
      messageBox.style.display = "block";
    }

    submitBtn.disabled = false;
    submitBtn.innerText = "Send Message";
  });
});
