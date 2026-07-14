import React, { useState } from "react";

export default function ExpertVerification({ initial = {}, onSave, onAddPhoto }) {
  const [form, setForm] = useState({ expertName:"", organization:"", date:"", correctedIdentity:"", notes:"", ...initial });
  const change = (field, value) => setForm((current) => ({ ...current, [field]:value }));
  return (
    <section className="js-finder-expert" aria-labelledby="expert-confirmation-title">
      <header><p>Outside confirmation</p><h3 id="expert-confirmation-title">Verify this identification</h3></header>
      <p>For high-stakes identification, contact a cooperative extension office, certified arborist, botanist, native-plant society, or qualified local field expert. Bring several clear photographs and a complete location description.</p>
      <ul><li>Whole plant and growth habit</li><li>Leaf front, back, edge, and stem attachment</li><li>Flowers, fruit, seeds, bark, and habitat</li></ul>
      <div className="js-finder-expert__fields">
        <label><span>Expert name</span><input value={form.expertName} onChange={(event) => change("expertName", event.target.value)} /></label>
        <label><span>Organization</span><input value={form.organization} onChange={(event) => change("organization", event.target.value)} /></label>
        <label><span>Confirmation date</span><input type="date" value={form.date} onChange={(event) => change("date", event.target.value)} /></label>
        <label><span>Corrected identity</span><input value={form.correctedIdentity} onChange={(event) => change("correctedIdentity", event.target.value)} /></label>
        <label className="is-wide"><span>Expert notes</span><textarea rows="3" value={form.notes} onChange={(event) => change("notes", event.target.value)} /></label>
      </div>
      <div className="js-finder-actions">
        <button type="button" className="is-quiet" onClick={onAddPhoto}>Upload additional photos</button>
        <button type="button" onClick={() => onSave(form)}>Save expert record</button>
      </div>
    </section>
  );
}
