export default function(timestamp) {
  let date = new Date(timestamp*1000);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  return `${year}/${month}/${day}`
}