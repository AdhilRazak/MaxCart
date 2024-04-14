const client = require('twilio')(process.env.Acountsid, process.env.Acountauthtoken);


module.exports = {
    async sendPhoneOtp(phone) {
        try {
            await client.verify.services(process.env.servicesid)
                .verifications
                .create({
                    to: `+91${phone}`,
                    channel: 'sms',
                    body: 'Your OTP for signup',
                });
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw new Error('Failed to send OTP');
        }
    },

    async resendPhoneOtp(phone) {
        try {
            await client.verify.services(process.env.servicesid)
                .verifications
                .create({
                    to: `+91${phone}`,
                    channel: 'sms',
                    body: 'Signup to SHOPON using this code',
                });
            console.log('OTP resent successfully to:', phone);
        } catch (error) {
            console.error('Error resending OTP:', error);
            throw new Error('Failed to resend OTP');
        }
    }
};
