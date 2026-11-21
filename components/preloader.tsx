/**
 * The opening curtain, shown once per browser session: the name is written
 * across it while a counter runs, then it lifts off the page. It is plain
 * markup animated in CSS, so it never waits on scripts; the inline script only
 * decides, before first paint, whether this visit should see it.
 */
const DECIDE = `try{var r=document.documentElement;if(sessionStorage.getItem("yc-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches){r.dataset.intro="skip"}else{sessionStorage.setItem("yc-intro","1");r.dataset.intro="play"}}catch(e){document.documentElement.dataset.intro="skip"}`;

export const INTRO_MS = 1500;

export function Preloader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: DECIDE }} />
      <div className="preloader" aria-hidden="true">
        <span className="preloader-mark">YCAY</span>
        <span className="preloader-name">
          <span>يوسف شواي</span>
          <span>يوسف شواي</span>
        </span>
        <span className="preloader-count" />
      </div>
    </>
  );
}
