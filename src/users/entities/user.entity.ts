import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fullname: string;

    @Column()
    email: string;

    // Por motivos de simplicidad, vamos a guardar la contraseña en texto plano
    @Column()
    pass: string;

    @OneToMany(() => Task, (task) => task.owner)
    tasks: Task[];
}
