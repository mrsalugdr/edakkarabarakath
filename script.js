const API_URL =
  "https://script.google.com/macros/s/AKfycbzHSlcGVg7EUUJdKf6PoPA0UhJCgbnd78lgy7bYRdGAzYplX7Pj8v8-fA2l4JFWxyGQ/exec";

const recordsContainer = document.getElementById("customerRecords");

async function loadCustomers() {
  recordsContainer.innerHTML = "Loading customers...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "getCustomers"
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to load customers");
    }

    displayCustomers(result.customers || []);

  } catch (error) {
    console.error(error);

    recordsContainer.innerHTML = `
      <div class="error">
        Customer records load ചെയ്യാൻ കഴിഞ്ഞില്ല.
        <br>
        ${error.message}
      </div>
    `;
  }
}

function displayCustomers(customers) {

  if (!customers.length) {
    recordsContainer.innerHTML = `
      <div class="empty">
        No customer records found.
      </div>
    `;
    return;
  }

  recordsContainer.innerHTML = customers.map(customer => {

    const phone = String(customer.phone || "")
      .replace(/\D/g, "");

    const whatsappMessage = encodeURIComponent(
      `Hello ${customer.customerName || ""},

Your stitching order ${customer.referenceId || ""} is ready.

Thank you,
EDAkkara Barakath`
    );

    const whatsappUrl =
      `https://wa.me/${phone}?text=${whatsappMessage}`;

    return `
      <div class="customer-card">

        <div class="customer-header">
          <strong>${escapeHtml(customer.referenceId)}</strong>
          <span>${escapeHtml(customer.stitchingStatus || "")}</span>
        </div>

        <h3>${escapeHtml(customer.customerName || "")}</h3>

        <p>
          📞 ${escapeHtml(customer.phone || "")}
        </p>

        <p>
          📍 ${escapeHtml(customer.place || "")}
        </p>

        <p>
          👗 ${escapeHtml(customer.itemType || "")}
        </p>

        <p>
          📅 ${escapeHtml(customer.receivedDate || "")}
        </p>

        <a
          class="whatsapp-button"
          href="${whatsappUrl}"
          target="_blank"
        >
          WhatsApp
        </a>

      </div>
    `;

  }).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

loadCustomers();
