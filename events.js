const common = {
    description: String,
    initial_date: Date,
    final_date: Date,
    initial_hour: String,
    final_hour: String,
    suspend_till: Date,
    priority: "Alta" | "Media" | "Baixa",
    schedules: ["Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Monday" | "Sunday"],
    sms: [String],
    email: [String],
    active: Boolean,
    continuous: Boolean,
    once_a_day: Boolean
}

const siege = {
    siege: _id,
    in: Boolean,
    out: Boolean,
    ...common
}

const panic = {
    ...common
}

const ignition = {
    on: Boolean,
    off: Boolean,
    ...common
}

const battery = {
    ...common
}

const velocity = {
    velocity: Number,
    operator: "greaterOrEq" | "lessThan",
    ...common
}

const siegeAndVelocity = {
    velocity: Number,
    operator: "greaterOrEq" | "lessThan",
    in: Boolean,
    out: Boolean,
    ...common
}

const ignitionAndVelocity = {
    on: Boolean,
    off: Boolean,
    velocity: Number,
    operator: "greaterOrEq" | "lessThan",
    ...common
}

const points = {
    points: [JSON],
    in: Boolean,
    out: Boolean,
    radius: Number,
    ...common
}

const pointsAndTime = {
    points: [JSON],
    in: Boolean,
    out: Boolean,
    radius: Number,
    time: String,
    ...common
}

const anchor = {
    siege: _id,
    point: JSON,
    active: Boolean
}