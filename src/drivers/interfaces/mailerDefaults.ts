export interface DefaultEmailParams { 
    to: string | string[];
    from: {email: string};
    subject: string;
    templateId: string;
    dynamic_template_data: any; // eslint-disable-line camelcase
    text?: string;
    html?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    headers?: any;
}


/**
 * Mail Constants
 */

 export enum FROM {
    NO_REPLY = "INSO < >"
}
export enum SUBJECTS {
    CONFIRM_EMAIL = "Please confirm your Inso Email",
    RESET_PASSWORD = "Reset Password link",
    CONFIRM_PASSWORD_RESET = "Password Reset"
}

export enum TEMPLATES {
    CONFIRM_EMAIL = "confirm this email address",
    RESET_PASSWORD = 'reset password request',
    CONFIRM_PASSWORD_RESET = "confirm password reset"
}