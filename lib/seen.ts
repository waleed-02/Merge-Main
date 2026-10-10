/**
 * Runs inline, before first paint and before React hydrates: repeat visitors
 * get `data-seen` on <html>, which removes the preloader and plays the hero
 * intro straight away (see globals.css).
 */
export const SEEN_SCRIPT = `try{if(localStorage.getItem("mm-seen"))document.documentElement.dataset.seen="1";localStorage.setItem("mm-seen","1")}catch(e){}`;
