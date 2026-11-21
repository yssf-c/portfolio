"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { MapPin, Pause, Play } from "lucide-react";

/**
 * Off the clock: recent travels as a row of strips that open under the
 * pointer, beside the record currently on repeat, which plays a preview.
 */

const travelPhotos = [
  { src: "/travel/amsterdam.jpg", place: "Amsterdam", location: "Amsterdam, NL" },
  { src: "/travel/barcelona.jpg", place: "Barcelona", location: "Barcelona, ES" },
  { src: "/travel/chelsea-cottage.jpg", place: "Chelsea Cottage", location: "Chelsea, QC" },
  { src: "/travel/french-rivera.jpg", place: "French Riviera", location: "Côte d'Azur, FR" },
  { src: "/travel/laarache.jpg", place: "Laarache", location: "Larache, MA" },
  { src: "/travel/nerja.jpg", place: "Nerja", location: "Nerja, ES" },
  { src: "/travel/nice.jpg", place: "Nice", location: "Nice, FR" },
  { src: "/travel/ottawa-sunset.jpg", place: "Ottawa Sunset", location: "Ottawa, CA" },
  { src: "/travel/victoria-islands.jpg", place: "Victoria Islands", location: "Victoria, CA" },
];

const TRACK = { title: "SOMETIMES", artist: "Riles", album: "The 25th Hour", deezerId: "3579493971" };
const EASE = [0.55, 0.45, 0.16, 1] as const;
const RISE = [0.16, 1, 0.3, 1] as const;

const formatTime = (seconds: number) => {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
};

function SectionTitle() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <div ref={ref} className="flex items-center" aria-hidden="true">
      <motion.span
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 1, ease: EASE }}
        className="text-section font-light text-foreground"
      >
        LI
      </motion.span>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        className="mx-2 flex flex-col items-center md:mx-4"
      >
        <span className="arabic-bracket text-lg md:text-xl">「</span>
        <span className="font-arabic text-xl text-[hsl(var(--gold))] md:text-3xl">حياة</span>
        <span className="arabic-bracket text-lg md:text-xl">」</span>
      </motion.div>
      <motion.span
        initial={{ opacity: 0, x: 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
        transition={{ duration: 1, ease: EASE }}
        className="text-section font-light text-foreground"
      >
        FE
      </motion.span>
    </div>
  );
}

/** The photos side by side as narrow strips; the one pointed at opens to show the whole picture. */
function Travels() {
  const [active, setActive] = useState(3);
  return (
    <div className="life-travels">
      <div className="life-head">
        <span>Recent travels</span>
        <span className="tabular-nums">
          {String(active + 1).padStart(2, "0")} / {String(travelPhotos.length).padStart(2, "0")}
        </span>
      </div>
      <ul className="life-strips">
        {travelPhotos.map((photo, index) => (
          <li
            key={photo.src}
            className="life-strip"
            data-active={active === index ? "" : undefined}
            onPointerEnter={(event) => event.pointerType === "mouse" && setActive(index)}
          >
            <button type="button" onClick={() => setActive(index)} onFocus={() => setActive(index)} aria-label={photo.location}>
              <Image
                src={photo.src}
                alt={`${photo.place}, from a recent trip`}
                fill
                sizes="(min-width: 1024px) 45vw, 75vw"
                className="object-cover"
              />
              <span className="life-strip-shade" aria-hidden="true" />
              <span className="life-strip-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="life-strip-place" aria-hidden="true">
                <MapPin />
                {photo.location}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The record on repeat: the sleeve, the disc that slides out and spins while it plays, and the controls. */
function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/music/preview?trackId=${TRACK.deezerId}`)
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.previewUrl) setPreviewUrl(data.previewUrl);
      })
      .catch(() => {
        // No preview: the play button stays disabled.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setIsPlaying(false);
      setTime(0);
    };
    const onMeta = () => setDuration(audio.duration);
    const onTime = () => setTime(audio.currentTime);
    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [previewUrl]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return;
    if (isPlaying) {
      audio.pause();
      return;
    }
    setIsLoading(true);
    try {
      await audio.play();
    } catch {
      setIsLoading(false);
    }
  };

  const progress = duration ? Math.min(1, time / duration) : 0;

  return (
    <div className="life-player vinyl-container" data-playing={isPlaying ? "" : undefined}>
      {previewUrl && <audio ref={audioRef} src={previewUrl} preload="metadata" />}

      <div className="life-head">
        <span>Currently on repeat</span>
        <span className="life-eq" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="life-record" aria-hidden="true">
        <div className="life-disc">
          <span />
        </div>
        <div className="life-sleeve">
          <Image src="/album-cover.jpg" alt="" fill sizes="(min-width: 1024px) 22rem, 70vw" className="object-cover" />
        </div>
      </div>

      <div className="life-track">
        <div>
          <h3>{TRACK.title}</h3>
          <p>
            {TRACK.artist} · {TRACK.album}
          </p>
        </div>
        <button
          type="button"
          className="life-play"
          onClick={toggle}
          disabled={!previewUrl}
          aria-label={isPlaying ? `Pause ${TRACK.title}` : `Play a preview of ${TRACK.title} by ${TRACK.artist}`}
          data-loading={isLoading ? "" : undefined}
        >
          {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
      </div>

      <div className="life-progress" aria-hidden="true">
        <span className="tabular-nums">{formatTime(time)}</span>
        <i>
          <b style={{ transform: `scaleX(${progress.toFixed(4)})` }} />
        </i>
        <span className="tabular-nums">{formatTime(duration || 30)}</span>
      </div>
    </div>
  );
}

export function CurrentListen() {
  return (
    <section id="life" className="life relative py-24 md:py-32">
      <div className="container mx-auto px-6 md:px-12">
        <header className="life-header">
          <SectionTitle />
          <h2 className="sr-only">Off the clock</h2>
          <p>Away from the keyboard: where I’ve been lately, and what has been on repeat.</p>
        </header>

        <motion.div
          className="life-grid"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: RISE }}
        >
          <Travels />
          <Player />
        </motion.div>
      </div>
    </section>
  );
}
