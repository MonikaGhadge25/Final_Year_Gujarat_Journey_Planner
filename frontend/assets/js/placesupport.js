let currentPage = 1;
    const limit = 8;
    let loading = false;
    let totalPages = 1;
    let filters = {};

    const gallery = document.getElementById('body');
    const form = document.querySelector('.tour-search-form');

    function createPlaceCard(place) {
      const template = document.getElementById('place-card-template');
      const clone = template.content.cloneNode(true);

      const img = clone.querySelector('.card-image');
      const title = clone.querySelector('.card-title');
      const description = clone.querySelector('.card-description');
      const button = clone.querySelector('.view-more-btn');
      const nameDiv = clone.querySelector('.place_name');

      img.src = place.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image';
      img.alt = place.name;
      img.onerror = () => {
        img.src = 'https://via.placeholder.com/400x250?text=Image+Error';
      };

      title.textContent = place.name;
      description.textContent = place.intro || 'Explore Gujarat';
      nameDiv.textContent = place.name;
      button.onclick = () => openOverlay(place.name);

      return clone;
    }

    async function loadPlaces(reset = false) {
      if (loading || (currentPage > totalPages && !reset)) return;
      loading = true;

      if (reset) {
        gallery.innerHTML = '<div style="text-align: center; padding: 20px;">Loading places...</div>';
        currentPage = 1;
      }

      const query = new URLSearchParams({ ...filters, page: currentPage, limit });

      try {
        const res = await fetch(`http://localhost:8000/api/places/search?${query}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        totalPages = data.totalPages;

        if (reset) gallery.innerHTML = '';

        if (data.places?.length) {
          data.places.forEach(place => {
            const card = createPlaceCard(place);
            gallery.appendChild(card);
          });
          currentPage++;
        } else if (reset) {
          gallery.innerHTML = '<div style="text-align: center; padding: 20px;">No places found.</div>';
        }
      } catch (err) {
        if (reset) {
          gallery.innerHTML = '<div style="text-align: center; color: red; padding: 20px;">Failed to load places.</div>';
        }
        console.error(err);
      } finally {
        loading = false;
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      filters = {};
      for (let [key, value] of formData.entries()) {
        if (value.trim()) filters[key] = value.trim();
      }
      loadPlaces(true);
    });

    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadPlaces();
      }
    });

    function openOverlay(placeName) {
      const iframe = document.getElementById("placeIframe");
      const overlay = document.getElementById("overlayContainer");
      iframe.src = `single-page.html?place=${encodeURIComponent(placeName)}`;
      overlay.style.display = "flex";
    }

    function closeOverlay() {
      const overlay = document.getElementById("overlayContainer");
      const iframe = document.getElementById("placeIframe");
      overlay.style.display = "none";
      iframe.src = "";
    }

    loadPlaces();