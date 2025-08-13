function formatRupiah(value) {
    const number = typeof value === "string" ? parseInt(value, 10) : value;
    if (isNaN(number))
        return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(number);
}
export default formatRupiah;
