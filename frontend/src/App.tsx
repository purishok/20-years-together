import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Heart, Mail, Maximize2, Menu, Sparkles, X } from 'lucide-react'

type Photo = { id: string; src: string; title: string; subtitle: string; alt: string; category: 'couple' | 'family'; position: string }
type Celebration = { years: number; dedication: string; photos: Photo[]; wishes: string[]; letter: { title: string; paragraphs: string[]; signature: string } }

function Ornament({ light = false }: { light?: boolean }) {
  return <div className={`ornament ${light ? 'light' : ''}`} aria-hidden="true"><span /><Heart size={14} strokeWidth={1.3} /><span /></div>
}

function Modal({ children, onClose, className, label }: { children: ReactNode; onClose: () => void; className: string; label: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    const previous = document.activeElement as HTMLElement | null
    dialog.showModal()
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = oldOverflow
      previous?.focus()
    }
  }, [])
  return <dialog ref={ref} className={`modal ${className}`} aria-label={label} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="modal-inner">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Закрити"><X size={23} /></button>
      {children}
    </div>
  </dialog>
}

function Lightbox({ photos, initial, onClose }: { photos: Photo[]; initial: number; onClose: () => void }) {
  const [index, setIndex] = useState(initial)
  const move = useCallback((direction: number) => setIndex(value => (value + direction + photos.length) % photos.length), [photos.length])
  const touchX = useRef<number | null>(null)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])
  const photo = photos[index]
  return <Modal onClose={onClose} className="lightbox" label="Перегляд фотографій">
    <div className="lightbox-image" onTouchStart={e => { touchX.current = e.touches[0].clientX }} onTouchEnd={e => {
      if (touchX.current !== null && Math.abs(e.changedTouches[0].clientX - touchX.current) > 50) move(e.changedTouches[0].clientX < touchX.current ? 1 : -1)
      touchX.current = null
    }}>
      <img src={photo.src} alt={photo.alt} />
    </div>
    <div className="lightbox-bottom">
      <button className="icon-button" onClick={() => move(-1)} aria-label="Попереднє фото"><ArrowLeft /></button>
      <div aria-live="polite"><p className="lightbox-title">{photo.title}</p><span>{index + 1} / {photos.length}</span></div>
      <button className="icon-button" onClick={() => move(1)} aria-label="Наступне фото"><ArrowRight /></button>
    </div>
  </Modal>
}

function CelebrationPage({ data }: { data: Celebration }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [letterOpen, setLetterOpen] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')
  const [wish, setWish] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [celebrated, setCelebrated] = useState(false)
  const [shared, setShared] = useState(false)
  const [shareError, setShareError] = useState(false)
  const filtered = data.photos.filter(photo => filter === 'all' || photo.category === filter)
  const photo = data.photos[0]
  const closeLetter = useCallback(() => setLetterOpen(false), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])

  useEffect(() => {
    if (!celebrating) return
    const timeout = window.setTimeout(() => setCelebrating(false), 4500)
    return () => window.clearTimeout(timeout)
  }, [celebrating])
  useEffect(() => {
    if (!shared && !shareError) return
    const timeout = window.setTimeout(() => { setShared(false); setShareError(false) }, 4000)
    return () => window.clearTimeout(timeout)
  }, [shared, shareError])

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: '20 років разом', text: 'Наша історія любові. З річницею, мамо й тату!', url: window.location.href })
      else { await navigator.clipboard.writeText(window.location.href); setShared(true) }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setShareError(true)
    }
  }

  return <>
    <a className="skip-link" href="#main">Перейти до привітання</a>
    <header className="header">
      <a href="#home" className="brand" aria-label="20 років разом — на початок"><span className="brand-number">20<span>♡</span></span><span className="brand-label">РОКІВ<br />РАЗОМ</span></a>
      <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Головна навігація">
        <a href="#story" onClick={() => setMenuOpen(false)}>Ваша історія</a>
        <a href="#memories" onClick={() => setMenuOpen(false)}>Щасливі миті</a>
        <a href="#wishes" onClick={() => setMenuOpen(false)}>Побажання</a>
      </nav>
      <button className="header-letter" onClick={() => setLetterOpen(true)}>Для вас, з любов’ю <Heart size={15} /></button>
      <button className="menu-toggle icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'}>{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <main id="main">
      <section className="hero section-width" id="home">
        <div className="hero-copy">
          <p className="eyebrow"><span className="little-line" /> ОСОБЛИВИЙ ДЕНЬ. ОСОБЛИВА ЛЮБОВ.</p>
          <h1><span className="hero-first"><span className="twenty">{data.years}</span> років.</span><br /><em>Одна любов.</em></h1>
          <p className="hero-dedication">{data.dedication}</p>
          <p className="hero-description">Двадцять років пліч-о-пліч. Тисячі теплих митей.<br className="desktop-break" /> І ціле життя, сповнене любові.</p>
          <a href="#story" className="button primary">Це все про вас <ArrowDown size={16} /></a>
          <div className="hero-note"><span className="hand-heart">♡</span><span>Маленький подарунок<br />для найбільшої любові</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-outline" aria-hidden="true" />
          <div className="anniversary-stamp"><span>З РІЧНИЦЕЮ</span><Heart size={23} strokeWidth={1} /><span>МОЇ РІДНІ</span></div>
          <button className="hero-photo" onClick={() => setLightbox(0)} aria-label="Відкрити фото батьків"><img src={photo.src} alt={photo.alt} style={{ objectPosition: photo.position }} fetchPriority="high" /><span className="photo-hover"><Maximize2 size={20} /></span></button>
          <button className="polaroid" onClick={() => setLightbox(1)} aria-label="Відкрити фото в горах"><img src={data.photos[1].src} alt={data.photos[1].alt} /><span>щастя — бути поруч ♡</span></button>
          <span className="hero-side-note">НАША НАЙКРАЩА ІСТОРІЯ</span>
          <span className="hero-sparkle" aria-hidden="true">✧</span>
        </div>
        <a href="#story" className="scroll-cue"><span>ГОРТАЙТЕ З ЛЮБОВ’Ю</span><ArrowDown size={15} /></a>
      </section>

      <div className="ribbon" aria-hidden="true"><span>ДВІ ДОЛІ</span><Heart /><span>ОДНА СІМ’Я</span><Heart /><span>БЕЗЛІЧ СПОГАДІВ</span><Heart /><span>ЛЮБОВ НАЗАВЖДИ</span><Heart /></div>

      <section className="story section-width" id="story">
        <div className="section-heading"><p className="eyebrow">01 / НАЙЦІННІШЕ</p><h2>Ви створили більше,<br />ніж <em>історію кохання.</em></h2></div>
        <div className="story-copy"><span className="small-heart" aria-hidden="true">♡</span><p>Ви створили дім. Місце, де завжди зрозуміють, обіймуть і підтримають. Де звичайні дні стають особливими — просто тому, що ми разом.</p><p>Ваша любов — у маленьких речах. У турботі, у сміху, у погляді, якому не потрібні слова. І для мене немає нічого красивішого.</p><span className="story-signature">Дякую, що ви є одне в одного.</span></div>
        <div className="milestones"><div><span>20</span><p>років спільного шляху</p></div><div><span>2</span><p>серця в одному ритмі</p></div><div><span>1</span><p>найрідніша сім’я</p></div><div><span>∞</span><p>приводів сказати «люблю»</p></div></div>
      </section>

      <section className="memories" id="memories"><div className="section-width">
        <div className="gallery-heading"><div className="section-heading"><p className="eyebrow">02 / НАШ СІМЕЙНИЙ АЛЬБОМ</p><h2>Миті, що <em>назавжди.</em></h2></div><p className="section-description">У кожній фотографії — маленьке життя.<br />У кожній посмішці — велика любов.</p></div>
        <div className="gallery-toolbar"><div className="filters" aria-label="Фільтр фотографій">{[{ id: 'all', name: 'Усі спогади' }, { id: 'couple', name: 'Ви вдвох' }, { id: 'family', name: 'Наша сім’я' }].map(item => <button key={item.id} onClick={() => setFilter(item.id)} className={filter === item.id ? 'active' : ''} aria-pressed={filter === item.id}>{item.name}</button>)}</div><span className="gallery-count">{String(filtered.length).padStart(2, '0')} ЩАСЛИВИХ МИТЕЙ</span></div>
        <div className="gallery">{filtered.map((item, index) => <button className={`memory memory-${item.id}`} key={item.id} onClick={() => setLightbox(data.photos.findIndex(p => p.id === item.id))} aria-label={`Переглянути: ${item.title}`}>
          <div className="memory-image"><img src={item.src} alt={item.alt} style={{ objectPosition: item.position }} loading="lazy" /><span className="memory-open"><ArrowUpRight size={21} /></span></div><div className="memory-caption"><div><h3>{item.title}</h3><p>{item.subtitle}</p></div><span>{String(index + 1).padStart(2, '0')}</span></div>
        </button>)}{filter === 'all' && <div className="album-quote"><Ornament /><p>Найкраще,<br />що можна тримати<br />в житті, —<br /><em>одне одного.</em></p><span>І НЕХАЙ ТАК БУДЕ ЗАВЖДИ</span></div>}</div>
        <p className="gallery-hint"><Maximize2 size={13} /> Натисніть на фото, щоб зупинити мить</p>
      </div></section>

      <section className="letter-section section-width" id="letter"><div className="letter-art" aria-hidden="true"><div className="letter-paper"><Heart size={22} strokeWidth={1} /><span>Моїм найріднішим</span><i /><i /><i /><span className="paper-sign">З любов’ю…</span></div><div className="envelope"><div className="wax-seal"><Heart size={27} strokeWidth={1} /></div></div><span className="letter-doodle">особисто для вас ↗</span></div><div className="letter-copy"><p className="eyebrow">03 / ТЕ, ЩО НА СЕРЦІ</p><h2>Є слова, які хочеться<br />сказати <em>особисто.</em></h2><p>Цей маленький лист — про велику вдячність.<br />За вашу любов. За нашу сім’ю. За все.</p><button className="button primary" onClick={() => setLetterOpen(true)}><Mail size={17} /> Відкрити лист</button><span className="letter-footnote">Написано з найтеплішими почуттями</span></div></section>

      <section className="wishes-section" id="wishes"><div className="wishes-inner section-width"><p className="eyebrow">04 / ВІД УСЬОГО СЕРЦЯ</p><h2>20 побажань.<br /><em>І всі — для вас.</em></h2><Ornament light /><div className="wish-content" aria-live="polite" aria-atomic="true"><span className="wish-number">{String(wish + 1).padStart(2, '0')} / {data.wishes.length}</span><p key={wish}>{data.wishes[wish]}</p></div><div className="wish-controls"><button className="icon-button" aria-label="Попереднє побажання" onClick={() => setWish((wish - 1 + data.wishes.length) % data.wishes.length)}><ArrowLeft size={19} /></button><span>Ще трішки теплих слів</span><button className="icon-button" aria-label="Наступне побажання" onClick={() => setWish((wish + 1) % data.wishes.length)}><ArrowRight size={19} /></button></div><span className="wishes-deco left" aria-hidden="true">♡</span><span className="wishes-deco right" aria-hidden="true">♡</span></div></section>

      <section className="closing section-width"><p className="eyebrow">ВАША ІСТОРІЯ ТРИВАЄ</p><h2>Найкраще — <em>ще попереду.</em></h2><p>Нехай буде ще стільки ж. І ще стільки ж.<br />І завжди — разом.</p><button className={`button primary celebrate-button ${celebrated ? 'celebrated' : ''}`} onClick={() => { setCelebrating(true); setCelebrated(true) }}><Heart size={17} fill={celebrated ? 'currentColor' : 'none'} />{celebrated ? 'Люблю вас безмежно!' : 'З річницею, мої рідні!' }<Sparkles size={16} /></button><span className="celebration-message" aria-live="polite">{celebrated ? 'Нехай ця любов триває вічно ♡' : '\u00a0'}</span></section>
    </main>

    <footer className="footer section-width"><a className="footer-logo" href="#home">20 років <em>разом.</em></a><span>Створено з любов’ю. Для найрідніших. <Heart size={12} /></span><button onClick={share} className="share-button">{shared ? <><Check size={14} /> Посилання скопійовано</> : <>Поділитися теплом <ArrowUpRight size={15} /></>}</button><span className="share-status" role="status">{shareError ? 'Не вдалося поділитися. Скопіюйте адресу з браузера.' : ''}</span></footer>

    {letterOpen && <Modal onClose={closeLetter} className="letter-modal" label="Лист для мами й тата"><Ornament /><p className="eyebrow">ЛИСТ ІЗ ЛЮБОВ’Ю</p><h2>{data.letter.title}</h2>{data.letter.paragraphs.map(paragraph => <p className="letter-paragraph" key={paragraph}>{paragraph}</p>)}<p className="letter-signature">{data.letter.signature} <Heart size={18} /></p></Modal>}
    {lightbox !== null && <Lightbox photos={data.photos} initial={lightbox} onClose={closeLightbox} />}
    {celebrating && <div className="confetti" aria-hidden="true">{Array.from({ length: 48 }, (_, i) => <i key={i} style={{ '--x': `${(i * 37) % 100}%`, '--delay': `${(i % 9) * 0.14}s`, '--drift': `${(i % 2 ? 1 : -1) * (30 + (i * 11) % 130)}px`, '--color': ['#792f42', '#c5a261', '#e2b6a9', '#95896b'][i % 4] } as CSSProperties}>{i % 3 === 0 ? '♡' : '✦'}</i>)}</div>}
  </>
}

export default function App() {
  const [data, setData] = useState<Celebration | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const timeout = window.setTimeout(() => controller.abort(), 10000)
    setError(false)
    fetch('/api/celebration', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Could not load celebration'); return response.json() })
      .then((value: Celebration) => { if (active) setData(value) })
      .catch(() => { if (active) setError(true) })
      .finally(() => window.clearTimeout(timeout))
    return () => { active = false; controller.abort(); window.clearTimeout(timeout) }
  }, [attempt])

  if (!data) return <main className="loading-screen"><span className="loading-mark">20<span>♡</span></span><h1>{error ? 'Ще мить — і ми разом.' : 'Готуємо дещо особливе…'}</h1><p role="status">{error ? 'Не вдалося завантажити привітання. Спробуйте ще раз.' : 'Для найрідніших. З любов’ю.'}</p>{error ? <button className="button primary" onClick={() => setAttempt(attempt + 1)}>Спробувати ще раз <ArrowRight size={16} /></button> : <span className="loading-dot" />}</main>
  return <CelebrationPage data={data} />
}
