// src/components/PersonCard.tsx
import React from "react";
import { Person } from "../types/person";
import nameIcon from '../assets/name.png';
import addressIcon from '../assets/adresse.png';
import telefonIcon from '../assets/telefon.png';
import webIcon from '../assets/web.png';
import emailIcon from '../assets/email.png';
import '../styles/PersonCard.css';

interface PersonCardProps {
    person: Person;
}

const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
    return (
        <table className="person-card-table">
            <tbody>
            <tr>
                <td className="icon-cell"><img src={nameIcon} alt="Name Icon" /></td>
                <td className="label">Name:</td>
                <td>{person.name}</td>
            </tr>
            <tr>
                <td className="icon-cell"><img src={nameIcon} alt="Last Name Icon" /></td>
                <td className="label">Lastname:</td>
                <td>{person.lastName}</td>
            </tr>
            <tr>
                <td className="icon-cell"><img src={addressIcon} alt="Address Icon" /></td>
                <td className="label">Address:</td>
                <td>{person.address}</td>
            </tr>
            <tr>
                <td className="icon-cell"><img src={emailIcon} alt="Email Icon" /></td>
                <td className="label">Email:</td>
                <td>{person.email}</td>
            </tr>
            <tr>
                <td className="icon-cell"><img src={telefonIcon} alt="Phone Icon" /></td>
                <td className="label">Phone:</td>
                <td>{person.tel}</td>
            </tr>
            <tr>
                <td className="icon-cell"><img src={webIcon} alt="Web Icon" /></td>
                <td className="label">Web:</td>
                <td>{person.url}</td>
            </tr>
            </tbody>
        </table>
    );
};

export default PersonCard;
