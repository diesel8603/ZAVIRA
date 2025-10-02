// Basit tek sayfa JS: randevu kaydı, localStorage, sahip paneli, CSV export
(function () {
  // sabitler
  const OWNER_PASSWORD = 'zaviraAdmin2025'; // isteğe göre değiştir
  const imgGallery = ['images/gal1.jpg','images/gal2.jpg','images/gal3.jpg','images/gal4.jpg','images/gal5.jpg','images/gal6.jpg'];
  const services = [
    {title:'Lazer Epilasyon', text:'Uzun süreli ve güvenli epilasyon çözümleri, tüm vücut bölgeleri.'},
    {title:'Cilt Bakımı', text:'Kişiye özel cilt bakımı, peeling, LED terapi.'},
    {title:'İğneli Estetik', text:'Profesyonel iğneli uygulamalar ve son teknoloji cihazlar.'}
  ];
  const testimonials = [
    {name:'Ayşe K.', text:'Profesyonel ekip, çok memnun kaldım.'},
    {name:'Elif T.', text:'Hijyen ve ilgi mükemmeldi.'},
    {name:'Merve Y.', text:'Sonuçlar beklediğimden iyi çıktı.'}
  ];

  // DOM referansları
  const servicesGrid = document.getElementById('servicesGrid');
  const galleryGrid = document.getElementById('galleryGrid');
  const testimonialsGrid = document.getElementById('testimonialsGrid');
  const bookingForm = document.getElementById('bookingForm');
  const formMsg = document.getElementById('formMsg');

  const ownerBtn = document.getElementById('ownerBtn');
  const ownerModal = document.getElementById('ownerModal');
  const ownerClose = document.getElementById('ownerClose');
  const ownerLogin = document.getElementById('ownerLogin');
  const ownerPass = document.getElementById('ownerPass');
  const ownerPanel = document.getElementById('ownerPanel');
  const authBox = document.getElementById('authBox');
  const bookingsTableBody = document.querySelector('#bookingsTable tbody');
  const bookCount = document.getElementById('bookCount');
  const exportCsvBtn = document.getElementById('exportCsv');
  const ownerClear = document.getElementById('ownerClear');

  // sayfa yılı
  document.getElementById('year').textContent = new Date().getFullYear();

  // içeriği doldur
  function renderServices() {
    servicesGrid.innerHTML = '';
    services.forEach(s=>{
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<div style="width:48px;height:48px;border-radius:8px;background:rgba(201,74,103,0.07);display:flex;align-items:center;justify-content:center;font-weight:700;color:${getComputedStyle(document.documentElement).getPropertyValue('--rose-700')};">${s.title.charAt(0)}</div>
        <h3 style="margin-top:12px;color:#9b334d">${s.title}</h3>
        <p style="color:#475569;margin-top:8px">${s.text}</p>
        <a href="#appointment" style="display:inline-block;margin-top:10px;color:#b03b57;font-weight:600">Randevu Al →</a>`;
      servicesGrid.appendChild(card);
    })
  }
  function renderGallery() {
    galleryGrid.innerHTML = '';
    for (let i=0;i<imgGallery.length;i++){
      const div = document.createElement('div');
      div.className = '';
      div.innerHTML = `<img src="${imgGallery[i]}" alt="gal-${i}" />`;
      galleryGrid.appendChild(div);
    }
  }
  function renderTestimonials(){
    testimonialsGrid.innerHTML = '';
    testimonials.forEach(t=>{
      const d = document.createElement('div'); d.className = 'card';
      d.innerHTML = `<p style="font-style:italic;color:#475569">“${t.text}”</p><div style="margin-top:12px;font-weight:700;color:#94354a">- ${t.name}</div>`;
      testimonialsGrid.appendChild(d);
    });
  }

  renderServices();
  renderGallery();
  renderTestimonials();

  // localStorage yönetimi
  function getBookings(){
    try {
      const s = localStorage.getItem('zavira_bookings');
      return s ? JSON.parse(s) : [];
    } catch(e){
      console.error(e);
      return [];
    }
  }
  function saveBookings(arr){
    localStorage.setItem('zavira_bookings', JSON.stringify(arr));
  }

  // telefon validasyonu: Türkiye mobil 5xxxxxxxxx veya +905xxxxxxxxx
  function validatePhone(p){
    const cleaned = (p||'').replace(/\s|\-|\(|\)/g,'');
    return /^((\+90)|0)?5\d{9}$/.test(cleaned);
  }

  // form submit
  bookingForm.addEventListener('submit', function(e){
    e.preventDefault();
    const data = {
      name: this.name.value.trim(),
      surname: this.surname.value.trim(),
      phone: this.phone.value.trim(),
      service: this.service.value,
      datetime: this.datetime.value,
      note: this.note.value.trim(),
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    if(!data.name || !data.surname || !data.phone || !data.datetime){
      showFormMsg('Lütfen gerekli alanları doldurun.', 'error'); return;
    }
    if(!validatePhone(data.phone)){
      showFormMsg('Geçerli bir telefon girin (5xxxxxxxxx veya +905xxxxxxxxx).', 'error'); return;
    }
    const arr = getBookings();
    arr.unshift(data);
    saveBookings(arr);
    this.reset();
    showFormMsg('Randevunuz alındı. En kısa sürede arayacağız.', 'success');
  });

  function showFormMsg(text, type){
    formMsg.textContent = text;
    formMsg.className = 'form-msg ' + (type==='success' ? 'ok' : 'err');
    setTimeout(()=>{ formMsg.textContent=''; formMsg.className='form-msg'; }, 6000);
  }

  // owner modal
  ownerBtn.addEventListener('click', function(){ ownerModal.setAttribute('aria-hidden','false'); ownerModal.style.display='flex'; });
  ownerClose.addEventListener('click', closeOwner);
  function closeOwner(){ ownerModal.setAttribute('aria-hidden','true'); ownerModal.style.display='none'; ownerPass.value=''; ownerPanel.hidden=true; authBox.hidden=false; renderBookingsTable(); }

  ownerLogin.addEventListener('click', function(){
    if(ownerPass.value === OWNER_PASSWORD){
      authBox.hidden = true;
      ownerPanel.hidden = false;
      renderBookingsTable();
    } else {
      alert('Yanlış şifre.');
    }
  });
  ownerClear.addEventListener('click', function(){ ownerPass.value=''; });

  // render bookings in owner table
  function renderBookingsTable(){
    const arr = getBookings();
    bookingsTableBody.innerHTML = '';
    bookCount.textContent = arr.length;
    arr.forEach(b=>{
      const tr = document.createElement('tr');
      const dateText = b.datetime ? (new Date(b.datetime)).toLocaleString() : '';
      tr.innerHTML = `<td>${escapeHtml(b.name)}</td><td>${escapeHtml(b.surname)}</td><td>${escapeHtml(b.phone)}</td><td>${escapeHtml(b.service)}</td><td>${escapeHtml(dateText)}</td>
        <td style="text-align:right"><button class="del-btn" data-id="${b.id}" style="background:transparent;border:0;color:#b03b57;cursor:pointer">Sil</button></td>`;
      bookingsTableBody.appendChild(tr);
    });

    // attach delete handlers
    const dels = document.querySelectorAll('.del-btn');
    dels.forEach(btn=>{
      btn.addEventListener('click', function(){
        const id = +this.getAttribute('data-id');
        if(!confirm('Rezervasyonu silmek istediğinize emin misiniz?')) return;
        const filtered = getBookings().filter(x=>x.id!==id);
        saveBookings(filtered);
        renderBookingsTable();
      });
    });
  }

  // CSV export
  exportCsvBtn.addEventListener('click', function(){
    const arr = getBookings();
    if(!arr.length){ alert('Kayıt yok'); return; }
    const header = ['id','name','surname','phone','service','datetime','note','createdAt'];
    const rows = arr.map(r=>header.map(h=>`"${String(r[h] || '').replace(/"/g,'""')}"`).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `zavira_bookings_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  });

  // utils
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }

  // Back to top
  document.getElementById('backTop').addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  // Render bookings on load if modal open
  // preload images existence isn't validated here - ensure images exist in images/
})();
