    const gallery = document.getElementById('hotelGallery');
    const form = document.querySelector('.hotel-search-form');
    const template = document.getElementById('hotelCardTemplate');
    let currentPage = 1;
    const limit = 6;
    let loading = false;
    let totalPages = 1;
    let filters = {};

    function createHotelCard(hotel) {
      const clone = template.content.cloneNode(true);
      
      // Handle different image formats from hotel dashboard
      let imageUrl = 'https://via.placeholder.com/400x250?text=No+Image';
      
      if (hotel.image) {
        // If image is already a data URL (from hotelcontroller.js)
        if (typeof hotel.image === 'string' && hotel.image.startsWith('data:image/')) {
          imageUrl = hotel.image;
        }
        // If image has base64 field
        else if (hotel.image.base64) {
          imageUrl = `data:image/jpeg;base64,${hotel.image.base64}`;
        }
        // If image has $binary field (MongoDB format)
        else if (hotel.image.$binary && hotel.image.$binary.base64) {
          imageUrl = `data:image/jpeg;base64,${hotel.image.$binary.base64}`;
        }
      }
      // Fallback to imageUrl field if present
      else if (hotel.imageUrl) {
        imageUrl = hotel.imageUrl;
      }
      
      // Handle rating from both old and new structure
      let rating = '★★★';
      if (hotel.rating) {
        rating = '★'.repeat(Math.min(hotel.rating, 5));
      } else if (hotel.hotel_details && hotel.hotel_details.rating) {
        rating = '★'.repeat(Math.min(hotel.hotel_details.rating, 5));
      }
      
      // Handle price from room_types (new structure)
      let price = '₹--';
      if (hotel.price) {
        price = `₹${hotel.price}`;
      } else if (hotel.room_types && hotel.room_types.length > 0) {
        const minPrice = Math.min(...hotel.room_types.map(room => {
          let roomPrice = room.price_per_night;
          if (typeof roomPrice === 'string') {
            roomPrice = roomPrice.replace('₹', '').replace(',', '');
          }
          return parseInt(roomPrice) || 0;
        }));
        if (minPrice > 0) {
          price = `₹${minPrice}`;
        }
      }
      
      // Handle location from both structures
      let location = 'Gujarat';
      if (hotel.location?.district) {
        location = hotel.location.district;
      } else if (hotel.hotel_details?.location?.district) {
        location = hotel.hotel_details.location.district;
      }
      
      // Handle name from both structures
      let hotelName = 'Hotel';
      if (hotel.name) {
        hotelName = hotel.name;
      } else if (hotel.hotel_details?.hotel_name) {
        hotelName = hotel.hotel_details.hotel_name;
      }

      clone.querySelector('.hotel-img').src = imageUrl;
      clone.querySelector('.hotel-img').alt = hotelName;
      clone.querySelector('.hotel-card-title').textContent = hotelName;
      clone.querySelector('.hotel-card-desc').innerHTML = `Rating: ${rating}<br>Location: ${location}<br>Price: ${price} / night`;
      clone.querySelector('.hotel-card-btn').addEventListener('click', () => {
        window.location.href = `hoteldetail.html?id=${hotel._id}`;
      });

      gallery.appendChild(clone);
    }

    async function loadHotels(reset = false) {
      if (loading || (currentPage > totalPages && !reset)) return;
      loading = true;

      if (reset) {
        gallery.innerHTML = '<div style="text-align:center;padding:20px;">Loading hotels...</div>';
        currentPage = 1;
      }

      const query = new URLSearchParams({ ...filters, page: currentPage, limit });
      try {
        const res = await fetch(`http://localhost:8000/api/hotels/search?${query.toString()}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        totalPages = data.totalPages;
        if (reset) gallery.innerHTML = '';
        if (!data.hotels.length && reset) {
          gallery.innerHTML = '<div style="text-align:center;padding:20px;">No hotels found.</div>';
          return;
        }

        data.hotels.forEach(createHotelCard);
        currentPage++;
      } catch (err) {
        console.error('Failed to load hotels:', err);
        if (reset) {
          gallery.innerHTML = '<div style="text-align:center;padding:20px;color:red;">Failed to load hotels. Please try again.</div>';
        }
      } finally {
        loading = false;
      }
    }

    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadHotels();
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const formData = new FormData(form);
      filters = {};
      for (let [key, val] of formData.entries()) {
        if (val.trim()) filters[key] = val.trim();
      }
      loadHotels(true);
    });

    loadHotels();