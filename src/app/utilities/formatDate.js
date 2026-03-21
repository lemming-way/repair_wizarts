const formatDate = (date) => {
    const _date = new Date(date)
    return `${_date.getDate()}.${_date.getMonth() + 1}.${_date.getFullYear()}`
}

export default formatDate
