import React from "react";
import { Check, Eye } from "lucide-react";

export default function GardenStyleCard({style,isActive,isPreviewing,onPreview,onApply}){
  return <article
    className={`${isActive?"is-active ":""}${isPreviewing?"is-previewing":""}`.trim()}
    role="listitem"
    aria-label={`${style.name} garden style${isActive?", currently active":""}`}
  >
    <button
      className="js-skin-dialog__image-button"
      type="button"
      aria-label={`Select ${style.name} garden style`}
      aria-pressed={isPreviewing}
      onClick={()=>onPreview(style.id)}
    >
      <picture><img src={style.thumbnail} alt={`${style.name} garden style preview`}/></picture>
      <span><Eye size={14}/> Preview</span>
    </button>
    <div className="js-skin-dialog__copy">
      <span>{isActive?<><Check size={12}/> Currently Active</>:isPreviewing?"Previewing":"Garden style"}</span>
      <strong>{style.name}</strong>
      <p>{style.description}</p>
    </div>
    <div className="js-skin-dialog__actions">
      <button type="button" aria-label={`Preview ${style.name} garden style`} aria-pressed={isPreviewing} onClick={()=>onPreview(style.id)}>Preview</button>
      <button className="is-primary" type="button" disabled={isActive} aria-label={isActive?`${style.name} is currently active`:`Apply ${style.name} garden style`} onClick={()=>onApply(style.id)}>{isActive?<><Check size={14}/> Currently Active</>:"Apply Style"}</button>
    </div>
  </article>;
}
