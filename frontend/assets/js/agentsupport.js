    let currentPage = 1;
    const limit = 8;
    let loading = false;
    let totalPages = 1;
    const agentContainer = document.getElementById('agentContainer');

    function createAgentCard(agent) {
      const template = document.getElementById('agentCardTemplate');
      const clone = template.content.cloneNode(true);

      const getDummyAvatar = (gender) => {
        return gender && gender.toLowerCase() === 'female'
          ? 'https://randomuser.me/api/portraits/women/32.jpg'
          : 'https://randomuser.me/api/portraits/men/10.jpg';
      };

      const imageUrl = getDummyAvatar(agent.gender);
      const location = agent.district || agent.location || agent.city || 'Gujarat';
      const rating = agent.rating || 4;
      const full = Math.floor(rating);
      const half = rating % 1 !== 0;
      const stars = '⭐'.repeat(full) + (half ? '⭐' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));

      const escapedId = agent._id || `agent_${Date.now()}`;
      const agentName = agent.name || 'Unknown Agent';

      clone.querySelector('.agent-image').src = imageUrl;
      clone.querySelector('.agent-image').alt = `Agent ${agentName}`;
      clone.querySelector('.agent-name').textContent = agentName;
      clone.querySelector('.agent-location').textContent = location;
      clone.querySelector('.agent-experience').textContent = agent.experience ? `${agent.experience} years` : 'Not specified';
      clone.querySelector('.agent-age').textContent = agent.age || 'Not specified';
      clone.querySelector('.agent-gender').textContent = agent.gender || 'Not specified';
      clone.querySelector('.agent-languages').textContent = agent.language || agent.languages || 'Not specified';
      clone.querySelector('.agent-fees').textContent = agent.fees || agent.hourlyRate || 'Contact for pricing';
      clone.querySelector('.agent-rating').textContent = stars;
      clone.querySelector('.agent-speciality').textContent = agent.specialties || agent.speciality || agent.expertise || 'General Services';

      clone.querySelector('.book-btn-agent').addEventListener('click', () => {
        window.location.href = `book.html?agentId=${encodeURIComponent(escapedId)}&agentName=${encodeURIComponent(agentName)}`;
      });

      return clone;
    }

    async function loadAgents(reset = false) {
      if (loading || (currentPage > totalPages && !reset)) return;
      loading = true;

      if (reset) {
        agentContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Loading agents...</div>';
        currentPage = 1;
      }

      try {
        const query = new URLSearchParams({ page: currentPage, limit });
        const res = await fetch(`http://localhost:8000/api/agents/search?${query.toString()}`);
        const data = await res.json();

        totalPages = data.totalPages || 1;

        if (reset) {
          agentContainer.innerHTML = '';
        }

        if (data.agents && data.agents.length > 0) {
          data.agents.forEach(agent => {
            agentContainer.appendChild(createAgentCard(agent));
          });
          currentPage++;
        } else if (reset) {
          agentContainer.innerHTML = '<div style="text-align: center; padding: 20px;">No agents found.</div>';
        }

      } catch (err) {
        console.error('Error loading agents:', err);
        if (reset) {
          agentContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">Failed to load agents.</div>';
        }
      } finally {
        loading = false;
      }
    }

    function closeAgentOverlay() {
      const overlay = document.getElementById("agentOverlayContainer");
      overlay.style.display = "none";
      document.getElementById("agentIframe").src = "";
    }

    // Infinite scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
          loadAgents();
        }
      }, 200);
    });

    // Initial Load
    document.addEventListener('DOMContentLoaded', async () => {
      await loadAgents(true);
      if (document.body.offsetHeight <= window.innerHeight) {
        loadAgents();
      }
    });