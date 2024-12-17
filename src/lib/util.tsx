
export function getShortChartName(name: string) {
  var n = name.replace('_INFOBAR_TITLE_', '_').replace('_HALFDOUBLE_', '_');
  const nsplit = n.split('_');
  const songtype = nsplit[nsplit.length - 1];
  const songname = n.split('_-_')[0].replace(/_+/g, ' ');
  
  var shortname = songname;
  if (songtype != 'ARCADE') {
    shortname = shortname + ' ' + songtype.toLowerCase();
  }
  return shortname;
}


export function getShortChartNameWithLevel(name: string) {
  var n = name.replace('_INFOBAR_TITLE_', '_').replace('_HALFDOUBLE_', '_');
  const nsplit = n.split('_');
  const sordlevel = nsplit[nsplit.length - 2];
  const songtype = nsplit[nsplit.length - 1];
  const songname = n.split('_-_')[0].replace(/_+/g, ' ');
  
  var shortname = songname + ' ' + sordlevel;
  if (songtype != 'ARCADE') {
    shortname = shortname + ' ' + songtype.toLowerCase();
  }
  return shortname;
}