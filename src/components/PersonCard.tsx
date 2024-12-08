import React from "react";
import nameIcon from '../assets/name.png';
import addressIcon from '../assets/adresse.png';
import telefonIcon from '../assets/telefon.png';
import webIcon from '../assets/web.png';
import emailIcon from '../assets/email.png';
import './PersonCard.css'; // Separate CSS für PersonCard

interface Person {
    name: string;
    lastName: string;
    address: string;
    city: string;
    tel: string;
    url: string;
    email: string;
}

interface Props {
    person: Person;
    style?: React.CSSProperties;
}

const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
    <tr>
        <td>
            <img src={icon} alt={`${label} Icon`} />
        </td>
        <td className="label">{label}</td>
        <td>{value}</td>
    </tr>
);

const PersonCard: React.FC<Props> = ({ person, style }) => {
    return (
        <div className="person-card" style={style}>
            <table>
                <tbody>
                <InfoRow icon={nameIcon} label="Name:" value={person.name} />
                <InfoRow icon={nameIcon} label="Lastname:" value={person.lastName} />
                <InfoRow icon={addressIcon} label="Address:" value={person.address} />
                <InfoRow icon={emailIcon} label="Email:" value={person.email} />
                <InfoRow icon={telefonIcon} label="Phone:" value={person.tel} />
                <InfoRow icon={webIcon} label="Web:" value={person.url} />
                </tbody>
            </table>
        </div>
    );
};

export default PersonCard;
