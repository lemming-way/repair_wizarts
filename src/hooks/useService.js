import {
    useEffect,
    useMemo,
    useState
} from "react"

const useService = (service, init) => {
    const [response, setResponse] = useState({
        data: init,
        error: null,
        refetch() { }
    })

    useEffect(() => {
        const refetchFn = (resolved) => (value) => {
            if (resolved) {
                return setResponse({
                    data: value,
                    error: null,
                    refetch() {
                        service()
                            .then(refetchFn(true))
                            .catch(refetchFn(false))
                    }
                })
            }

            return setResponse({
                data: init,
                error: value.message,
                refetch() {
                    service()
                        .then(refetchFn(true))
                        .catch(refetchFn(false))
                }
            })
        }

        service()
            .then((data) => {
                setResponse((prev) => ({
                    ...prev,
                    data,
                    refetch() {
                        service()
                            .then(refetchFn(true))
                            .catch(refetchFn(false))
                    }
                }))
            }).catch((err) => {
                setResponse((prev) => ({
                    ...prev,
                    error: err.message,
                    refetch() {
                        service()
                            .then(refetchFn(true))
                            .catch(refetchFn(false))
                    }
                }))
            })
    }, [])

    return response
}

const useServices = (serviceList = []) => {
    const initialState = useMemo(() =>
        serviceList.map((v) => ({
            data: v.init,
            error: null,
            refetch: () => { }
        })), [])
    const [response, setResponse] = useState(initialState)

    useEffect(() => {
        Promise.allSettled(serviceList.map((cb) => cb()))
            .then((values) => {
                setResponse((prev) => values.map((v, i) => {
                    const refetchFn = (resolved) => (value) => {
                        if (resolved) {
                            return setResponse((prev) => prev.map((v, j) => {
                                if (i !== j) {
                                    return v
                                }

                                return {
                                    data: value,
                                    error: null,
                                    refetch() {
                                        serviceList[i]()
                                            .then(refetchFn(true))
                                            .catch(refetchFn(false))
                                    }
                                }
                            }))
                        }

                        return setResponse((prev) => prev.map((v, j) => {
                            if (i !== j) {
                                return v
                            }

                            return {
                                data: initialState[i].data,
                                error: value.message,
                                refetch() {
                                    serviceList[i]()
                                        .then(refetchFn(true))
                                        .catch(refetchFn(false))
                                }
                            }
                        }))
                    }

                    if (v.status === 'rejected') {
                        return {
                            data: prev[i].data,
                            error: v.reason,
                            refetch() {
                                serviceList[i]()
                                    .then(refetchFn(true))
                                    .catch(refetchFn(false))
                            }
                        }
                    }

                    return {
                        data: v.value,
                        error: null,
                        refetch() {
                            serviceList[i]()
                                .then(refetchFn(true))
                                .catch(refetchFn(false))
                        }
                    }
                }))
            })
    }, [])

    return response
}

export {
    useService,
    useServices
}
