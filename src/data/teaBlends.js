// Personal Garden-to-Cup recipes are no longer shipped as product defaults.
export const teaBlends = [];
export const getTeaBlendById = (blendId) => teaBlends.find((blend) => blend.id === blendId);
